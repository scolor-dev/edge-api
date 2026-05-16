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

export interface TagWithCategory extends Tag {
  category_name: string | null
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
    const now = new Date().toISOString()
    await db
      .prepare('INSERT INTO tag_categories (id, name, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(data.id, data.name, data.slug, now, now)
      .run()
  },

  /**
   * カテゴリー更新
   * - tag_categories をUPDATE
   * - name・slugは必須（Partialではなく全フィールド必須）
   */
  async update(db: D1Database, id: string, data: Pick<TagCategory, 'name' | 'slug'>): Promise<void> {
    const now = new Date().toISOString()
    await db
      .prepare('UPDATE tag_categories SET name = ?, slug = ?, updated_at = ? WHERE id = ?')
      .bind(data.name, data.slug, now, id)
      .run()
  },

  /**
   * カテゴリー削除
   * - batchで原子的に実行
   * - 配下タグのcategory_idをNULLに更新してからDELETE
   */
  async delete(db: D1Database, id: string): Promise<void> {
    const now = new Date().toISOString()
    await db.batch([
      db.prepare('UPDATE tags SET category_id = NULL, updated_at = ? WHERE category_id = ?')
        .bind(now, id),
      db.prepare('DELETE FROM tag_categories WHERE id = ?')
        .bind(id),
    ])
  },
}

export const tagRepository = {
  /**
   * タグ一覧取得
   * - tags + tag_categories をJOIN
   * - category_nameも含むTagWithCategoryを返す
   */
  async getAll(db: D1Database): Promise<TagWithCategory[]> {
    const { results } = await db
      .prepare(`
        SELECT t.*, tc.name as category_name
        FROM tags t
        LEFT JOIN tag_categories tc ON t.category_id = tc.id
        ORDER BY t.name
      `)
      .all()
    return results as unknown as TagWithCategory[]
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
    const now = new Date().toISOString()
    await db
      .prepare('INSERT INTO tags (id, category_id, name, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(data.id, data.category_id, data.name, data.slug, now, now)
      .run()
  },

  /**
   * タグ更新
   * - name・slugは必須
   * - category_idはundefined=変更なし / null=カテゴリー解除 / string=変更
   */
  async update(
    db: D1Database,
    id: string,
    data: Pick<Tag, 'name' | 'slug'> & { category_id?: string | null }
  ): Promise<void> {
    const now = new Date().toISOString()
    if (data.category_id === undefined) {
      // category_idは変更しない
      await db
        .prepare('UPDATE tags SET name = ?, slug = ?, updated_at = ? WHERE id = ?')
        .bind(data.name, data.slug, now, id)
        .run()
    } else {
      // category_idも更新（nullでカテゴリー解除）
      await db
        .prepare('UPDATE tags SET name = ?, slug = ?, category_id = ?, updated_at = ? WHERE id = ?')
        .bind(data.name, data.slug, data.category_id, now, id)
        .run()
    }
  },

  /**
   * タグ削除
   * - tags をDELETE（project_tagsはCASCADEで削除）
   */
  async delete(db: D1Database, id: string): Promise<void> {
    await db
      .prepare('DELETE FROM tags WHERE id = ?')
      .bind(id)
      .run()
  },
}