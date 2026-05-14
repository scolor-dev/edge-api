export interface TagCategory {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  category_id: string | null
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export const tagCategoryRepository = {
  /**
   * カテゴリー一覧取得
   * - tag_categories を全件取得
   */
  async getAll(db: D1Database): Promise<TagCategory[]> {
    const { results } = await db
      .prepare('SELECT * FROM tag_categories ORDER BY name')
      .all()
    return results as unknown as TagCategory[]
  },

  /**
   * カテゴリー作成
   * - tag_categories にINSERT
   */
  async create(db: D1Database, data: Omit<TagCategory, 'created_at' | 'updated_at'>): Promise<void> {
    await db
      .prepare('INSERT INTO tag_categories (id, name, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(data.id, data.name, data.slug, new Date().toISOString(), new Date().toISOString())
      .run()
  },

  /**
   * カテゴリー更新
   * - tag_categories をUPDATE
   */
  async update(db: D1Database, id: string, data: Partial<Pick<TagCategory, 'name' | 'slug'>>): Promise<void> {
    await db
      .prepare('UPDATE tag_categories SET name = ?, slug = ?, updated_at = ? WHERE id = ?')
      .bind(data.name, data.slug, new Date().toISOString(), id)
      .run()
  },

  /**
   * カテゴリー削除
   * - 配下タグのcategory_idをNULLに更新
   * - tag_categories をDELETE
   */
  async delete(db: D1Database, id: string): Promise<void> {
    await db
      .prepare('UPDATE tags SET category_id = NULL, updated_at = ? WHERE category_id = ?')
      .bind(new Date().toISOString(), id)
      .run()
    await db
      .prepare('DELETE FROM tag_categories WHERE id = ?')
      .bind(id)
      .run()
  },
}

export const tagRepository = {
  /**
   * タグ一覧取得
   * - tags + tag_categories をJOIN
   */
  async getAll(db: D1Database): Promise<Tag[]> {
    const { results } = await db
      .prepare(`
        SELECT t.*, tc.name as category_name
        FROM tags t
        LEFT JOIN tag_categories tc ON t.category_id = tc.id
        ORDER BY t.name
      `)
      .all()
    return results as unknown as Tag[]
  },

  /**
   * IDでタグ1件取得
   * - tags をidで検索
   */
  async getById(db: D1Database, id: string): Promise<Tag | null> {
    return await db
      .prepare('SELECT * FROM tags WHERE id = ?')
      .bind(id)
      .first() as unknown as Tag | null
  },

  /**
   * カテゴリーでタグ絞り込み
   * - tags をcategory_idで絞り込み
   */
  async getByCategory(db: D1Database, categoryId: string): Promise<Tag[]> {
    const { results } = await db
      .prepare('SELECT * FROM tags WHERE category_id = ? ORDER BY name')
      .bind(categoryId)
      .all()
    return results as unknown as Tag[]
  },

  /**
   * タグ作成
   * - tags にINSERT
   */
  async create(db: D1Database, data: Omit<Tag, 'created_at' | 'updated_at'>): Promise<void> {
    await db
      .prepare('INSERT INTO tags (id, category_id, name, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(data.id, data.category_id, data.name, data.slug, new Date().toISOString(), new Date().toISOString())
      .run()
  },

  /**
   * タグ更新（名前・カテゴリー変更）
   * - tags をUPDATE
   */
  async update(db: D1Database, id: string, data: Partial<Pick<Tag, 'name' | 'slug' | 'category_id'>>): Promise<void> {
    await db
      .prepare('UPDATE tags SET name = ?, slug = ?, category_id = ?, updated_at = ? WHERE id = ?')
      .bind(data.name, data.slug, data.category_id, new Date().toISOString(), id)
      .run()
  },

  /**
   * タグ削除
   * - tags をDELETE（project_tags・note_tags・blog_tagsはCASCADEで削除）
   */
  async delete(db: D1Database, id: string): Promise<void> {
    await db
      .prepare('DELETE FROM tags WHERE id = ?')
      .bind(id)
      .run()
  },
}