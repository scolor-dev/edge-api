import { AppError, NotFoundError } from "../lib/errors"
import { storage } from "../lib/storage"
import { postRepository } from "../repositories/posts"

// R2 パスヘルパー
const r2 = {
	readme: (id: string) => `posts/${id}/README.md`,
}

export interface PostQuery {
	q?: string
	q_match?: "exact" | "partial"
	tags?: string[]
	tag_match?: "exact" | "partial"
	date_from?: string
	date_to?: string
	status?: "published" | "draft" | "private" | "archived"
	deleted?: "true" | "false" | "all"
}

export interface CreatePostInput {
	title: string
	slug: string
	thumbnail?: string
	description?: string
	body?: string
	keywords?: string
	date?: string
	status?: "published" | "draft" | "private" | "archived"
	content?: string
	tagIds?: string[]
}

export interface UpdatePostInput {
	title?: string
	slug?: string
	thumbnail?: string
	description?: string
	body?: string
	keywords?: string
	date?: string
	status?: "published" | "draft" | "private" | "archived"
	content?: string
	tagIds?: string[]
}

export const postService = {
	// ===========================
	// public
	// ===========================

	/**
	 * ブログ一覧取得
	 * - D1: posts + tags をJOIN・クエリ絞り込み
	 * - public は published・deleted=false のみ
	 */
	async getAll(db: D1Database, query: PostQuery) {
		return await postRepository.getAll(db, {
			...query,
			status: query.status ?? "published",
			deleted: query.deleted ?? "false",
		})
	},

	async adminGetAll(db: D1Database, query: PostQuery) {
		return await postRepository.getAll(db, {
			...query,
			deleted: query.deleted ?? "false",
		})
	},

	/**
	 * ブログ個別取得
	 * - D1: posts + tags をJOIN
	 * - R2: posts/{id}/README.md を取得
	 */
	async getBySlug(db: D1Database, bucket: R2Bucket, slug: string, includeDeleted = false) {
		const post = await postRepository.getBySlug(db, slug, includeDeleted)
		if (!post) return null

		const readme = await storage.getText(bucket, r2.readme(post.id))

		return { ...post, readme }
	},

	// ===========================
	// admin
	// ===========================

	/**
	 * ブログ作成
	 * - D1: slug の重複チェック
	 * - D1: posts に INSERT
	 * - R2: posts/{id}/README.md を PUT（content がある場合）
	 * - D1: post_tags に INSERT（tagIds がある場合）
	 */
	async create(db: D1Database, bucket: R2Bucket, data: CreatePostInput): Promise<{ id: string }> {
		const exists = await postRepository.existsBySlug(db, data.slug)
		if (exists) throw new AppError("slug already exists", 409)

		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await postRepository.create(db, {
			id,
			has_index: 0,
			title: data.title,
			slug: data.slug,
			thumbnail: data.thumbnail ?? null,
			description: data.description ?? null,
			body: data.body ?? null,
			keywords: data.keywords ?? null,
			date: data.date ?? now,
			status: data.status ?? "draft",
		})

		if (data.content) {
			await storage.putText(bucket, r2.readme(id), data.content)
		}

		if (data.tagIds && data.tagIds.length > 0) {
			await postRepository.setTags(db, id, data.tagIds)
		}

		return { id }
	},

	/**
	 * ブログ更新（PATCH）
	 * - D1: slug 変更時に重複チェック
	 * - D1: posts を差分 UPDATE
	 * - R2: posts/{id}/README.md を PUT（content がある場合）
	 * - D1: post_tags を一括更新（tagIds がある場合）
	 */
	async update(
		db: D1Database,
		bucket: R2Bucket,
		slug: string,
		data: UpdatePostInput,
	): Promise<void> {
		const post = await postRepository.getBySlug(db, slug)
		if (!post) throw new NotFoundError()

		if (data.slug && data.slug !== slug) {
			const exists = await postRepository.existsBySlug(db, data.slug, post.id)
			if (exists) throw new AppError("slug already exists", 409)
		}

		const { content, tagIds, ...rest } = data

		await Promise.all([
			content !== undefined
				? storage.putText(bucket, r2.readme(post.id), content)
				: Promise.resolve(),
			postRepository.patch(db, post.id, rest),
		])

		if (tagIds !== undefined) {
			await postRepository.setTags(db, post.id, tagIds)
		}
	},

	/**
	 * ブログ削除（論理削除）
	 * - D1: deleted_at をセット・delete_after に 30 日後をセット
	 * - R2 は削除しない（Cron Triggers で delete_after 到達後に物理削除）
	 */
	async delete(db: D1Database, slug: string): Promise<void> {
		const post = await postRepository.getBySlug(db, slug)
		if (!post) throw new NotFoundError()

		await postRepository.softDelete(db, post.id)
	},
}
