import { NotFoundError } from "../lib/errors"
import { tagCategoryRepository, tagRepository } from "../repositories/tags"

export interface CreateTagCategoryInput {
	name: string
	slug: string
}

export interface CreateTagInput {
	name: string
	slug: string
	category_id?: string
}

export interface UpdateTagInput {
	name: string
	slug: string
	category_id?: string | null // undefined=変更なし / null=解除 / string=変更
}

export const tagCategoryService = {
	/**
	 * カテゴリー一覧取得
	 * - D1: tag_categories を全件取得
	 */
	async getAll(db: D1Database) {
		return await tagCategoryRepository.getAll(db)
	},

	/**
	 * カテゴリー作成
	 * - D1: tag_categories にINSERT
	 */
	async create(db: D1Database, data: CreateTagCategoryInput): Promise<{ id: string }> {
		const id = crypto.randomUUID()
		await tagCategoryRepository.create(db, { id, ...data })
		return { id }
	},

	/**
	 * カテゴリー更新（name・slug両フィールド必須）
	 * - D1: tag_categories をUPDATE
	 */
	async update(db: D1Database, id: string, data: CreateTagCategoryInput): Promise<void> {
		await tagCategoryRepository.update(db, id, data)
	},

	/**
	 * カテゴリー削除
	 * - D1: 配下タグのcategory_idをNULLに
	 * - D1: tag_categories をDELETE
	 */
	async delete(db: D1Database, id: string): Promise<void> {
		await tagCategoryRepository.delete(db, id)
	},
}

export const tagService = {
	/**
	 * タグ一覧取得（フラット）
	 * - D1: tags + tag_categories をJOIN
	 */
	async getAll(db: D1Database) {
		return await tagRepository.getAll(db)
	},

	/**
	 * タグ一覧取得（カテゴリでグループ化）
	 * - D1: tags + tag_categories をJOIN → メモリ上でグルーピング
	 */
	async getAllGrouped(db: D1Database) {
		const [tags, categories] = await Promise.all([
			tagRepository.getAll(db),
			tagCategoryRepository.getAll(db),
		])

		const byCategory = tags.reduce<Record<string, typeof tags>>((acc, tag) => {
			if (tag.category_id) {
				if (!acc[tag.category_id]) acc[tag.category_id] = []
				acc[tag.category_id].push(tag)
			}
			return acc
		}, {})

		return {
			categories: categories.map((cat) => ({
				...cat,
				tags: (byCategory[cat.id] ?? []).map(({ id, name, slug }) => ({ id, name, slug })),
			})),
			uncategorized: tags
				.filter((t) => !t.category_id)
				.map(({ id, name, slug }) => ({ id, name, slug })),
		}
	},

	/**
	 * カテゴリーでタグ絞り込み
	 * - D1: tags をcategory_idで絞り込み
	 */
	async getByCategory(db: D1Database, categoryId: string) {
		return await tagRepository.getByCategory(db, categoryId)
	},

	/**
	 * タグ作成
	 * - D1: tags にINSERT
	 */
	async create(db: D1Database, data: CreateTagInput): Promise<{ id: string }> {
		const id = crypto.randomUUID()
		const { category_id, ...rest } = data
		await tagRepository.create(db, { id, category_id: category_id ?? null, ...rest })
		return { id }
	},

	/**
	 * タグ更新
	 * - name・slugは必須
	 * - category_id: undefined=変更なし / null=カテゴリー解除 / string=カテゴリー変更
	 * - D1: tags をUPDATE
	 */
	async update(db: D1Database, id: string, data: UpdateTagInput): Promise<void> {
		const tag = await tagRepository.getById(db, id)
		if (!tag) throw new NotFoundError()
		await tagRepository.update(db, id, data)
	},

	/**
	 * タグ削除
	 * - D1: tags をDELETE（project_tagsはCASCADEで削除）
	 */
	async delete(db: D1Database, id: string): Promise<void> {
		await tagRepository.delete(db, id)
	},
}
