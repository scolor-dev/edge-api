// src/services/tags.ts

import { tagRepository, tagCategoryRepository } from '../repositories/tags'
import { NotFoundError } from '../lib/errors'

export interface CreateTagCategoryInput {
  name: string
  slug: string
}

export interface UpdateTagCategoryInput extends Partial<CreateTagCategoryInput> {}

export interface CreateTagInput {
  name: string
  slug: string
  category_id?: string
}

export interface UpdateTagInput extends Partial<CreateTagInput> {}

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
   * カテゴリー更新
   * - D1: tag_categories をUPDATE
   */
  async update(db: D1Database, id: string, data: UpdateTagCategoryInput): Promise<void> {
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
   * タグ一覧取得
   * - D1: tags + tag_categories をJOIN
   */
  async getAll(db: D1Database) {
    return await tagRepository.getAll(db)
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
   * - D1: tags をUPDATE
   */
  async update(db: D1Database, id: string, data: UpdateTagInput): Promise<void> {
    const tag = await tagRepository.getById(db, id)
    if (!tag) throw new NotFoundError()
    await tagRepository.update(db, id, data)
  },

  /**
   * タグ削除
   * - D1: tags をDELETE（project_tags・note_tags・blog_tagsはCASCADE）
   */
  async delete(db: D1Database, id: string): Promise<void> {
    await tagRepository.delete(db, id)
  },
}