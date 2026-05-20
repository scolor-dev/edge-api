import { AppError, NotFoundError } from "../lib/errors"
import { emptyIndexJson, type IndexJson, type IndexSiblingEntry } from "../lib/indexJson"
import { storage } from "../lib/storage"
import { projectRepository } from "../repositories/projects"

// R2 パスヘルパー
const r2 = {
	readme: (id: string) => `projects/${id}/README.md`,
	index: (id: string) => `projects/${id}/index.json`,
	file: (id: string, fileId: string) => `projects/${id}/files/${fileId}`,
}

export interface ProjectQuery {
	q?: string
	q_match?: "exact" | "partial"
	tags?: string[]
	tag_match?: "exact" | "partial"
	date_from?: string
	date_to?: string
	status?: "published" | "draft" | "private" | "archived"
	deleted?: "true" | "false" | "all"
}

export interface CreateProjectInput {
	title: string
	slug: string
	thumbnail?: string
	description?: string
	body?: string
	links?: string
	keywords?: string
	date?: string
	status?: "published" | "draft" | "private" | "archived"
	content?: string
	tagIds?: string[]
	initDocs?: boolean
	siblings?: Record<string, IndexSiblingEntry>
}

export interface UpdateProjectInput {
	title?: string
	slug?: string
	thumbnail?: string
	description?: string
	body?: string
	links?: string
	keywords?: string
	date?: string
	status?: "published" | "draft" | "private" | "archived"
	content?: string
	tagIds?: string[]
	initDocs?: boolean
	siblings?: Record<string, IndexSiblingEntry>
}

export interface AddFileInput {
	path: string
	type: "file" | "folder"
	title: string
	description?: string
	date?: string
	tags?: string[]
	content?: string
}

export interface UpdateFileInput {
	title?: string
	description?: string
	date?: string
	tags?: string[]
	content?: string
}

export const projectService = {
	// ===========================
	// public
	// ===========================

	/**
	 * プロジェクト一覧取得
	 * - D1: projects + tags をJOIN・クエリ絞り込み
	 * - public は published・deleted=false のみ
	 */
	async getAll(db: D1Database, query: ProjectQuery) {
		return await projectRepository.getAll(db, {
			...query,
			status: query.status ?? "published",
			deleted: query.deleted ?? "false",
		})
	},

	/**
	 * プロジェクト個別取得
	 * - D1: projects + tags をJOIN
	 * - R2: projects/{id}/README.md を取得
	 * - R2: projects/{id}/index.json を取得（has_index=1 の場合）
	 */
	async getBySlug(db: D1Database, bucket: R2Bucket, slug: string, includeDeleted = false) {
		const project = await projectRepository.getBySlug(db, slug, includeDeleted)
		if (!project) return null

		const [readme, index] = await Promise.all([
			storage.getText(bucket, r2.readme(project.id)),
			project.has_index ? storage.getJson<IndexJson>(bucket, r2.index(project.id)) : null,
		])

		return { ...project, readme, index }
	},

	/**
	 * プロジェクト内ファイル取得
	 * - D1: slug でプロジェクトを取得（has_index チェック）
	 * - R2: index.json から fileId に一致するエントリを検索
	 * - R2: projects/{id}/files/{fileId} のファイル本体を取得
	 */
	async getFile(db: D1Database, bucket: R2Bucket, slug: string, fileId: string) {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()
		if (!project.has_index) throw new NotFoundError()

		const index = await storage.getJson<IndexJson>(bucket, r2.index(project.id))
		if (!index) throw new NotFoundError()

		const entry = Object.entries(index.files).find(([, v]) => v.uuid === fileId)
		if (!entry) throw new NotFoundError()

		const content = await storage.getText(bucket, r2.file(project.id, fileId))

		return { path: entry[0], meta: entry[1], content }
	},

	// ===========================
	// admin
	// ===========================

	/**
	 * プロジェクト作成
	 * - D1: slug の重複チェック
	 * - D1: projects に INSERT
	 * - R2: projects/{id}/README.md を PUT（content がある場合）
	 * - D1 + R2: initDocs または siblings がある場合 index.json を作成・has_index=1 に更新
	 * - D1: project_tags に INSERT（tagIds がある場合）
	 */
	async create(
		db: D1Database,
		bucket: R2Bucket,
		data: CreateProjectInput,
	): Promise<{ id: string }> {
		const exists = await projectRepository.existsBySlug(db, data.slug)
		if (exists) throw new AppError("slug already exists", 409)

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const needsIndex = data.initDocs || (data.siblings && Object.keys(data.siblings).length > 0)

		await projectRepository.create(db, {
			id,
			has_index: needsIndex ? 1 : 0,
			title: data.title,
			slug: data.slug,
			thumbnail: data.thumbnail ?? null,
			description: data.description ?? null,
			body: data.body ?? null,
			links: data.links ?? null,
			keywords: data.keywords ?? null,
			date: data.date ?? now,
			status: data.status ?? "draft",
		})

		await Promise.all([
			data.content ? storage.putText(bucket, r2.readme(id), data.content) : Promise.resolve(),
			needsIndex
				? storage.putJson(bucket, r2.index(id), {
						...emptyIndexJson(),
						siblings: data.siblings ?? {},
					})
				: Promise.resolve(),
		])

		if (data.tagIds && data.tagIds.length > 0) {
			await projectRepository.setTags(db, id, data.tagIds)
		}

		return { id }
	},

	/**
	 * プロジェクト更新（PATCH）
	 * - D1: slug 変更時に重複チェック
	 * - D1: projects を差分 UPDATE
	 * - R2: projects/{id}/README.md を PUT（content がある場合）
	 * - R2: initDocs または siblings がある場合 index.json を作成・更新
	 *   - siblings は渡した内容で REPLACE（index.json の他セクションは保持）
	 * - D1: project_tags を一括更新（tagIds がある場合）
	 */
	async update(
		db: D1Database,
		bucket: R2Bucket,
		slug: string,
		data: UpdateProjectInput,
	): Promise<void> {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()

		if (data.slug && data.slug !== slug) {
			const exists = await projectRepository.existsBySlug(db, data.slug, project.id)
			if (exists) throw new AppError("slug already exists", 409)
		}

		const needsIndexUpdate = data.initDocs || data.siblings !== undefined

		// README と index.json を並列更新
		await Promise.all([
			data.content
				? storage.putText(bucket, r2.readme(project.id), data.content)
				: Promise.resolve(),
			needsIndexUpdate
				? (async () => {
						const existing = project.has_index
							? ((await storage.getJson<IndexJson>(bucket, r2.index(project.id))) ??
								emptyIndexJson())
							: emptyIndexJson()

						const updated: IndexJson = {
							...existing,
							...(data.siblings !== undefined && { siblings: data.siblings }),
						}

						await storage.putJson(bucket, r2.index(project.id), updated)
					})()
				: Promise.resolve(),
		])

		const { content, tagIds, initDocs, siblings, ...rest } = data
		const hasIndexPatch = needsIndexUpdate && !project.has_index ? { has_index: 1 as const } : {}

		await projectRepository.patch(db, project.id, { ...rest, ...hasIndexPatch })

		if (tagIds !== undefined) {
			await projectRepository.setTags(db, project.id, tagIds)
		}
	},

	/**
	 * プロジェクト削除（論理削除）
	 * - D1: deleted_at をセット・delete_after に 30 日後をセット
	 * - R2 は削除しない（Cron Triggers で delete_after 到達後に物理削除）
	 */
	async delete(db: D1Database, slug: string): Promise<void> {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()

		await projectRepository.softDelete(db, project.id)
	},

	/**
	 * プロジェクト内ファイル追加
	 * - has_index=1 のプロジェクトのみ許可
	 * - type="file": R2 に projects/{id}/files/{uuid} として保存・index.json の files に追記
	 * - type="folder": index.json の folders に追記のみ（R2 への保存なし）
	 */
	async addFile(
		db: D1Database,
		bucket: R2Bucket,
		slug: string,
		data: AddFileInput,
	): Promise<{ uuid?: string }> {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()
		if (!project.has_index) throw new AppError("project is not docs-enabled", 400)

		const index =
			(await storage.getJson<IndexJson>(bucket, r2.index(project.id))) ?? emptyIndexJson()

		if (data.type === "file") {
			const uuid = crypto.randomUUID()

			await Promise.all([
				data.content
					? storage.putText(bucket, r2.file(project.id, uuid), data.content)
					: Promise.resolve(),
				storage.putJson(bucket, r2.index(project.id), {
					...index,
					files: {
						...index.files,
						[data.path]: {
							title: data.title,
							uuid,
							...(data.description !== undefined && { description: data.description }),
							...(data.date !== undefined && { date: data.date }),
							tags: data.tags ?? [],
						},
					},
				}),
			])

			return { uuid }
		}

		// type === "folder"
		await storage.putJson(bucket, r2.index(project.id), {
			...index,
			folders: {
				...index.folders,
				[data.path]: {
					title: data.title,
					...(data.description !== undefined && { description: data.description }),
					...(data.date !== undefined && { date: data.date }),
					tags: data.tags ?? [],
				},
			},
		})

		return {}
	},

	/**
	 * プロジェクト内ファイル編集
	 * - R2: content がある場合 projects/{id}/files/{fileId} を上書き
	 * - R2: メタデータがある場合 index.json の該当エントリを更新
	 */
	async updateFile(
		db: D1Database,
		bucket: R2Bucket,
		slug: string,
		fileId: string,
		data: UpdateFileInput,
	): Promise<void> {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()
		if (!project.has_index) throw new NotFoundError()

		const hasMeta =
			data.title !== undefined ||
			data.description !== undefined ||
			data.date !== undefined ||
			data.tags !== undefined

		await Promise.all([
			data.content !== undefined
				? storage.putText(bucket, r2.file(project.id, fileId), data.content)
				: Promise.resolve(),
			hasMeta
				? (async () => {
						const index = await storage.getJson<IndexJson>(bucket, r2.index(project.id))
						if (!index) throw new NotFoundError()

						const entry = Object.entries(index.files).find(([, v]) => v.uuid === fileId)
						if (!entry) throw new NotFoundError()

						const [path, existing] = entry
						await storage.putJson(bucket, r2.index(project.id), {
							...index,
							files: {
								...index.files,
								[path]: {
									...existing,
									...(data.title !== undefined && { title: data.title }),
									...(data.description !== undefined && { description: data.description }),
									...(data.date !== undefined && { date: data.date }),
									...(data.tags !== undefined && { tags: data.tags }),
								},
							},
						})
					})()
				: Promise.resolve(),
		])
	},

	/**
	 * プロジェクト内ファイル削除
	 * - R2: projects/{id}/files/{fileId} を削除
	 * - R2: index.json の files から該当エントリを削除
	 */
	async deleteFile(db: D1Database, bucket: R2Bucket, slug: string, fileId: string): Promise<void> {
		const project = await projectRepository.getBySlug(db, slug)
		if (!project) throw new NotFoundError()
		if (!project.has_index) throw new NotFoundError()

		const index = await storage.getJson<IndexJson>(bucket, r2.index(project.id))
		if (!index) throw new NotFoundError()

		const entry = Object.entries(index.files).find(([, v]) => v.uuid === fileId)
		if (!entry) throw new NotFoundError()

		const [path] = entry
		const { [path]: _, ...remainingFiles } = index.files

		await Promise.all([
			storage.delete(bucket, r2.file(project.id, fileId)),
			storage.putJson(bucket, r2.index(project.id), {
				...index,
				files: remainingFiles,
			}),
		])
	},
}
