export interface Project {
	id: string
	has_index: 0 | 1
	title: string
	slug: string
	thumbnail: string | null
	description: string | null
	body: string | null
	links: string | null
	keywords: string | null
	date: string | null
	status: "published" | "draft" | "private" | "archived"
	deleted_at: string | null
	delete_after: string | null
	created_at: string
	updated_at: string
}

export interface ProjectWithTags extends Project {
	tags: { id: string; name: string; slug: string }[]
}

// DB検索条件の型（サービス層のProjectQueryとは分離）
export interface ProjectFilter {
	status?: "published" | "draft" | "private" | "archived"
	deleted?: "true" | "false" | "all"
	q?: string
	q_match?: "exact" | "partial"
	tags?: string[]
	tag_match?: "exact" | "partial"
	date_from?: string
	date_to?: string
}

// replace・patchで使う更新可能フィールドの型
type ProjectMutableFields = Omit<
	Project,
	"id" | "created_at" | "updated_at" | "deleted_at" | "delete_after"
>

export const projectRepository = {
	/**
	 * プロジェクト一覧取得
	 * - D1: projects + project_tags + tags をJOIN
	 * - フィルター条件はサービス側で決定して渡す
	 */
	async getAll(db: D1Database, filter: ProjectFilter): Promise<ProjectWithTags[]> {
		const conditions: string[] = []
		const bindings: unknown[] = []

		// deleted絞り込み
		if (filter.deleted === "true") {
			conditions.push("p.deleted_at IS NOT NULL")
		} else if (filter.deleted === "all") {
			// 条件なし（全件）
		} else {
			conditions.push("p.deleted_at IS NULL")
		}

		// status絞り込み（サービス側で必ず指定する想定）
		if (filter.status) {
			conditions.push("p.status = ?")
			bindings.push(filter.status)
		}

		if (filter.q) {
			if (filter.q_match === "exact") {
				conditions.push("(p.title = ? OR p.description = ?)")
				bindings.push(filter.q, filter.q)
			} else {
				conditions.push("(p.title LIKE ? OR p.description LIKE ? OR p.keywords LIKE ?)")
				bindings.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`)
			}
		}

		if (filter.tags && filter.tags.length > 0) {
			if (filter.tag_match === "exact") {
				filter.tags.forEach((tag) => {
					conditions.push(`
            EXISTS (
              SELECT 1 FROM project_tags pt2
              JOIN tags t2 ON pt2.tag_id = t2.id
              WHERE pt2.project_id = p.id AND t2.slug = ?
            )
          `)
					bindings.push(tag)
				})
			} else {
				conditions.push(`
          EXISTS (
            SELECT 1 FROM project_tags pt2
            JOIN tags t2 ON pt2.tag_id = t2.id
            WHERE pt2.project_id = p.id
            AND t2.slug IN (${filter.tags.map(() => "?").join(",")})
          )
        `)
				bindings.push(...filter.tags)
			}
		}

		if (filter.date_from) {
			conditions.push("p.date >= ?")
			bindings.push(filter.date_from)
		}

		if (filter.date_to) {
			conditions.push("p.date <= ?")
			bindings.push(filter.date_to)
		}

		const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

		const { results } = await db
			.prepare(`
        SELECT
          p.*,
          JSON_GROUP_ARRAY(
            CASE WHEN t.id IS NOT NULL
            THEN JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug)
            ELSE NULL END
          ) as tags
        FROM projects p
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        ${where}
        GROUP BY p.id
        ORDER BY p.date DESC
      `)
			.bind(...bindings)
			.all()

		return (results as unknown as ProjectWithTags[]).map((r) => ({
			...r,
			tags: JSON.parse(r.tags as unknown as string).filter(Boolean),
		}))
	},

	/**
	 * id で1件取得
	 * - D1: projects + project_tags + tags をJOIN
	 * - includeDeleted: trueの場合は論理削除済みも取得（admin用）
	 */
	async getById(
		db: D1Database,
		id: string,
		includeDeleted = false,
	): Promise<ProjectWithTags | null> {
		const result = (await db
			.prepare(`
        SELECT
          p.*,
          JSON_GROUP_ARRAY(
            CASE WHEN t.id IS NOT NULL
            THEN JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug)
            ELSE NULL END
          ) as tags
        FROM projects p
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = ?
          ${includeDeleted ? "" : "AND p.deleted_at IS NULL"}
        GROUP BY p.id
      `)
			.bind(id)
			.first()) as unknown as ProjectWithTags | null

		if (!result) return null

		return {
			...result,
			tags: JSON.parse(result.tags as unknown as string).filter(Boolean),
		}
	},

	/**
	 * slug で1件取得
	 * - D1: projects + project_tags + tags をJOIN
	 * - includeDeleted: trueの場合は論理削除済みも取得（admin用）
	 */
	async getBySlug(
		db: D1Database,
		slug: string,
		includeDeleted = false,
	): Promise<ProjectWithTags | null> {
		const result = (await db
			.prepare(`
        SELECT
          p.*,
          JSON_GROUP_ARRAY(
            CASE WHEN t.id IS NOT NULL
            THEN JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug)
            ELSE NULL END
          ) as tags
        FROM projects p
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.slug = ?
          ${includeDeleted ? "" : "AND p.deleted_at IS NULL"}
        GROUP BY p.id
      `)
			.bind(slug)
			.first()) as unknown as ProjectWithTags | null

		if (!result) return null

		return {
			...result,
			tags: JSON.parse(result.tags as unknown as string).filter(Boolean),
		}
	},

	/**
	 * slug の存在確認
	 * - 作成・更新時の重複チェック用
	 * - excludeId: 更新時に自分自身を除外
	 */
	async existsBySlug(db: D1Database, slug: string, excludeId?: string): Promise<boolean> {
		const result = await db
			.prepare(`
        SELECT 1 FROM projects
        WHERE slug = ? ${excludeId ? "AND id != ?" : ""}
        LIMIT 1
      `)
			.bind(...(excludeId ? [slug, excludeId] : [slug]))
			.first()

		return result !== null
	},

	/**
	 * プロジェクト作成
	 * - D1: projects にINSERT
	 */
	async create(
		db: D1Database,
		data: Omit<Project, "created_at" | "updated_at" | "deleted_at" | "delete_after">,
	): Promise<void> {
		const now = new Date().toISOString()
		await db
			.prepare(`
        INSERT INTO projects (id, has_index, title, slug, thumbnail, description, body, links, keywords, date, status, deleted_at, delete_after, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
      `)
			.bind(
				data.id,
				data.has_index,
				data.title,
				data.slug,
				data.thumbnail,
				data.description,
				data.body,
				data.links,
				data.keywords,
				data.date,
				data.status,
				now,
				now,
			)
			.run()
	},

	/**
	 * プロジェクト全体更新（PUT用）
	 * - 全フィールド必須・undefined不可
	 * - D1: projects をUPDATE（論理削除済みは対象外）
	 */
	async replace(db: D1Database, id: string, data: ProjectMutableFields): Promise<void> {
		const now = new Date().toISOString()
		await db
			.prepare(`
        UPDATE projects
        SET has_index = ?, title = ?, slug = ?, thumbnail = ?, description = ?, body = ?, links = ?,
            keywords = ?, date = ?, status = ?, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `)
			.bind(
				data.has_index,
				data.title,
				data.slug,
				data.thumbnail,
				data.description,
				data.body,
				data.links,
				data.keywords,
				data.date,
				data.status,
				now,
				id,
			)
			.run()
	},

	/**
	 * プロジェクト部分更新（PATCH用）
	 * - 渡されたフィールドだけ動的にSET
	 * - D1: projects をUPDATE（論理削除済みは対象外）
	 */
	async patch(db: D1Database, id: string, data: Partial<ProjectMutableFields>): Promise<void> {
		const entries = Object.entries(data).filter(([, v]) => v !== undefined)
		if (entries.length === 0) return

		const setClause = entries.map(([k]) => `${k} = ?`).join(", ")
		const bindings = [...entries.map(([, v]) => v), new Date().toISOString(), id]

		await db
			.prepare(`
        UPDATE projects
        SET ${setClause}, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `)
			.bind(...bindings)
			.run()
	},

	/**
	 * プロジェクト論理削除
	 * - D1: deleted_at・delete_afterを更新
	 * - delete_after: 30日後を完全削除予定日時とする
	 */
	async softDelete(db: D1Database, id: string): Promise<void> {
		const now = new Date()
		const deleteAfter = new Date(now)
		deleteAfter.setDate(deleteAfter.getDate() + 30)

		await db
			.prepare(`
        UPDATE projects
        SET deleted_at = ?, delete_after = ?, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `)
			.bind(now.toISOString(), deleteAfter.toISOString(), now.toISOString(), id)
			.run()
	},

	/**
	 * プロジェクト完全削除
	 * - D1: projects をDELETE（project_tagsはCASCADE）
	 * - Cron Triggersからdelete_afterを過ぎたものを対象に呼ぶ
	 */
	async hardDelete(db: D1Database, id: string): Promise<void> {
		await db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run()
	},

	/**
	 * 完全削除対象の一覧取得
	 * - delete_afterを過ぎた論理削除済みプロジェクトを取得
	 * - Cron Triggersから呼ぶ
	 */
	async getExpiredDeleted(db: D1Database): Promise<Project[]> {
		const now = new Date().toISOString()
		const { results } = await db
			.prepare(`
        SELECT * FROM projects
        WHERE deleted_at IS NOT NULL
          AND delete_after <= ?
      `)
			.bind(now)
			.all()

		return results as unknown as Project[]
	},

	/**
	 * タグ一括更新
	 * - D1: project_tags を全DELETE後にINSERT
	 * - batchで原子的に実行
	 */
	async setTags(db: D1Database, projectId: string, tagIds: string[]): Promise<void> {
		await db.batch([
			db.prepare("DELETE FROM project_tags WHERE project_id = ?").bind(projectId),
			...tagIds.map((tagId) =>
				db
					.prepare("INSERT INTO project_tags (project_id, tag_id) VALUES (?, ?)")
					.bind(projectId, tagId),
			),
		])
	},

	/**
	 * タグ個別追加
	 * - D1: project_tags にINSERT
	 */
	async addTag(db: D1Database, projectId: string, tagId: string): Promise<void> {
		await db
			.prepare("INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)")
			.bind(projectId, tagId)
			.run()
	},

	/**
	 * タグ個別削除
	 * - D1: project_tags をDELETE
	 */
	async removeTag(db: D1Database, projectId: string, tagId: string): Promise<void> {
		await db
			.prepare("DELETE FROM project_tags WHERE project_id = ? AND tag_id = ?")
			.bind(projectId, tagId)
			.run()
	},
}
