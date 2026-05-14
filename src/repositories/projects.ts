// src/repositories/projects.ts

import type { ProjectQuery } from '../services/projects'

export interface Project {
  id: string
  type: 'simple' | 'docs'
  title: string
  slug: string
  description: string | null
  links: string | null
  index_path: string | null
  keywords: string | null
  date: string | null
  status: 'published' | 'draft' | 'private' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProjectWithTags extends Project {
  tags: { id: string; name: string; slug: string }[]
}

export const projectRepository = {
  /**
   * プロジェクト一覧取得
   * - D1: projects + project_tags + tags をJOIN
   * - クエリパラメータで絞り込み
   */
  async getAll(db: D1Database, query: ProjectQuery): Promise<ProjectWithTags[]> {
    const conditions: string[] = []
    const bindings: unknown[] = []

    // statusの絞り込み（adminはany、publicはpublishedのみ）
    if (query.status) {
      conditions.push('p.status = ?')
      bindings.push(query.status)
    } else {
      conditions.push('p.status = ?')
      bindings.push('published')
    }

    // テキスト検索
    if (query.q) {
      if (query.q_match === 'exact') {
        conditions.push('(p.title = ? OR p.description = ?)')
        bindings.push(query.q, query.q)
      } else {
        conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.keywords LIKE ?)')
        bindings.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`)
      }
    }

    // タグ絞り込み
    if (query.tags && query.tags.length > 0) {
      if (query.tag_match === 'exact') {
        // 完全一致：指定タグを全部持つ
        query.tags.forEach(tag => {
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
        // 部分一致：指定タグのいずれかを持つ
        conditions.push(`
          EXISTS (
            SELECT 1 FROM project_tags pt2
            JOIN tags t2 ON pt2.tag_id = t2.id
            WHERE pt2.project_id = p.id
            AND t2.slug IN (${query.tags.map(() => '?').join(',')})
          )
        `)
        bindings.push(...query.tags)
      }
    }

    // 日付範囲
    if (query.date_from) {
      conditions.push('p.date >= ?')
      bindings.push(query.date_from)
    }

    if (query.date_to) {
      conditions.push('p.date <= ?')
      bindings.push(query.date_to)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

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

    return (results as unknown as ProjectWithTags[]).map(r => ({
      ...r,
      tags: JSON.parse(r.tags as unknown as string).filter(Boolean),
    }))
  },

  /**
   * slug で1件取得
   * - D1: projects + project_tags + tags をJOIN
   */
  async getBySlug(db: D1Database, slug: string): Promise<ProjectWithTags | null> {
    const result = await db
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
        GROUP BY p.id
      `)
      .bind(slug)
      .first() as unknown as ProjectWithTags | null

    if (!result) return null

    return {
      ...result,
      tags: JSON.parse(result.tags as unknown as string).filter(Boolean),
    }
  },

  /**
   * プロジェクト作成
   * - D1: projects にINSERT
   */
  async create(db: D1Database, data: Omit<Project, 'created_at' | 'updated_at'>): Promise<void> {
    const now = new Date().toISOString()
    await db
      .prepare(`
        INSERT INTO projects (id, type, title, slug, description, links, index_path, keywords, date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        data.id, data.type, data.title, data.slug,
        data.description, data.links, data.index_path,
        data.keywords, data.date, data.status, now, now
      )
      .run()
  },

  /**
   * プロジェクト更新
   * - D1: projects をUPDATE
   */
  async update(db: D1Database, id: string, data: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    await db
      .prepare(`
        UPDATE projects
        SET type = ?, title = ?, slug = ?, description = ?, links = ?,
            index_path = ?, keywords = ?, date = ?, status = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(
        data.type, data.title, data.slug, data.description,
        data.links, data.index_path, data.keywords,
        data.date, data.status, new Date().toISOString(), id
      )
      .run()
  },

  /**
   * プロジェクト削除
   * - D1: projects をDELETE（project_tagsはCASCADE）
   */
  async delete(db: D1Database, id: string): Promise<void> {
    await db
      .prepare('DELETE FROM projects WHERE id = ?')
      .bind(id)
      .run()
  },

  /**
   * タグ一括更新
   * - D1: project_tags を全DELETE後にINSERT
   */
  async setTags(db: D1Database, projectId: string, tagIds: string[]): Promise<void> {
    await db
      .prepare('DELETE FROM project_tags WHERE project_id = ?')
      .bind(projectId)
      .run()

    if (tagIds.length === 0) return

    await Promise.all(
      tagIds.map(tagId =>
        db.prepare('INSERT INTO project_tags (project_id, tag_id) VALUES (?, ?)')
          .bind(projectId, tagId)
          .run()
      )
    )
  },

  /**
   * タグ個別追加
   * - D1: project_tags にINSERT
   */
  async addTag(db: D1Database, projectId: string, tagId: string): Promise<void> {
    await db
      .prepare('INSERT OR IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)')
      .bind(projectId, tagId)
      .run()
  },

  /**
   * タグ個別削除
   * - D1: project_tags をDELETE
   */
  async removeTag(db: D1Database, projectId: string, tagId: string): Promise<void> {
    await db
      .prepare('DELETE FROM project_tags WHERE project_id = ? AND tag_id = ?')
      .bind(projectId, tagId)
      .run()
  },
}