// src/services/projects.ts

import { projectRepository } from '../repositories/projects'
import { storage } from '../lib/storage'
import { NotFoundError } from '../lib/errors'

export interface ProjectQuery {
  q?: string
  q_match?: 'exact' | 'partial'
  tags?: string[]
  tag_match?: 'exact' | 'partial'
  date_from?: string
  date_to?: string
  status?: 'published' | 'draft' | 'private' | 'archived'
}

export interface CreateProjectInput {
  type: 'simple' | 'docs'
  title: string
  slug: string
  description?: string
  links?: string
  keywords?: string
  date?: string
  status?: 'published' | 'draft' | 'private' | 'archived'
  content?: string
  tagIds?: string[]
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export const projectService = {
  // ===========================
  // public
  // ===========================

  /**
   * プロジェクト一覧取得
   * - D1: projects + tags をJOIN・クエリ絞り込み
   */
  async getAll(db: D1Database, query: ProjectQuery) {
    return await projectRepository.getAll(db, query)
  },

  /**
   * プロジェクト個別取得
   * - D1: projects + tags をJOIN
   * - R2(SCD_CONTENTS): {slug}/index.md を取得
   * - R2(SCD_CONTENTS): {slug}/index.json を取得（type === 'docs'のみ）
   */
  async getBySlug(db: D1Database, bucket: R2Bucket, slug: string) {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) return null

    const content = project.index_path
      ? await storage.getText(bucket, project.index_path)
      : null

    let folders = null
    if (project.type === 'docs') {
      const json = await storage.getText(bucket, `${slug}/index.json`)
      folders = json ? JSON.parse(json) : null
    }

    return { ...project, content, folders }
  },

  /**
   * フォルダ構造取得
   * - R2(SCD_CONTENTS): {slug}/index.json を取得してパース
   */
  async getFolders(bucket: R2Bucket, slug: string) {
    const json = await storage.getText(bucket, `${slug}/index.json`)
    if (!json) return null
    return JSON.parse(json)
  },

  /**
   * ファイル取得
   * - R2(SCD_CONTENTS): {slug}/{path} のMDを取得
   */
  async getFile(bucket: R2Bucket, slug: string, path: string) {
    return await storage.getText(bucket, `${slug}/${path}`)
  },

  // ===========================
  // admin
  // ===========================

  /**
   * プロジェクト作成
   * - D1: projects にINSERT
   * - D1: project_tags にINSERT（tagIdsがある場合）
   * - R2(SCD_CONTENTS): {slug}/index.md をPUT（contentがある場合）
   * - R2(SCD_CONTENTS): {slug}/index.json をPUT（type === 'docs'の場合）
   */
  async create(db: D1Database, bucket: R2Bucket, data: CreateProjectInput): Promise<{ id: string }> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    let index_path: string | null = null
    if (data.content) {
      index_path = `${data.slug}/index.md`
      await storage.put(bucket, index_path, data.content)
    }

    if (data.type === 'docs') {
      await storage.put(bucket, `${data.slug}/index.json`, JSON.stringify({ folders: [], files: [] }))
    }

    await projectRepository.create(db, {
      id,
      type: data.type,
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      links: data.links ?? null,
      index_path,
      keywords: data.keywords ?? null,
      date: data.date ?? now,
      status: data.status ?? 'draft',
    })

    if (data.tagIds && data.tagIds.length > 0) {
      await projectRepository.setTags(db, id, data.tagIds)
    }

    return { id }
  },

  /**
   * プロジェクト更新
   * - D1: projects をUPDATE
   * - D1: project_tags を一括更新（tagIdsがある場合）
   * - R2(SCD_CONTENTS): index.md をPUT（contentがある場合）
   * - R2(SCD_CONTENTS): slug変更時に旧パスのファイルを新パスに移動・旧ファイル削除
   */
  async update(db: D1Database, bucket: R2Bucket, slug: string, data: UpdateProjectInput): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()

    const newSlug = data.slug ?? slug
    let index_path = project.index_path

    // slug変更時にR2のファイルを移動
    if (data.slug && data.slug !== slug) {
      // index.mdの移動
      if (project.index_path) {
        const oldContent = await storage.getText(bucket, project.index_path)
        if (oldContent) {
          const newPath = `${newSlug}/index.md`
          await storage.put(bucket, newPath, oldContent)
          await storage.delete(bucket, project.index_path)
          index_path = newPath
        }
      }

      // docsの場合はindex.jsonも移動
      if (project.type === 'docs') {
        const oldJson = await storage.getText(bucket, `${slug}/index.json`)
        if (oldJson) {
          await storage.put(bucket, `${newSlug}/index.json`, oldJson)
          await storage.delete(bucket, `${slug}/index.json`)
        }
      }
    }

    // contentが更新された場合
    if (data.content) {
      index_path = `${newSlug}/index.md`
      await storage.put(bucket, index_path, data.content)
    }

    await projectRepository.update(db, project.id, { ...data, index_path })

    if (data.tagIds) {
      await projectRepository.setTags(db, project.id, data.tagIds)
    }
  },

  /**
   * プロジェクト削除
   * - D1: projects をDELETE（project_tagsはCASCADE）
   * - R2(SCD_CONTENTS): {slug}/ 配下を全削除
   */
  async delete(db: D1Database, bucket: R2Bucket, slug: string): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()

    await projectRepository.delete(db, project.id)
    await storage.deleteAll(bucket, `${slug}/`)
  },

  /**
   * フォルダ構造更新
   * - R2(SCD_CONTENTS): {slug}/index.json をPUT
   */
  async updateFolders(bucket: R2Bucket, slug: string, data: unknown): Promise<void> {
    await storage.put(bucket, `${slug}/index.json`, JSON.stringify(data))
  },

  /**
   * ファイルアップロード
   * - R2(SCD_CONTENTS): {slug}/{path} にMDをPUT
   */
  async uploadFile(bucket: R2Bucket, slug: string, path: string, content: string): Promise<void> {
    await storage.put(bucket, `${slug}/${path}`, content)
  },

  /**
   * ファイル削除
   * - R2(SCD_CONTENTS): {slug}/{path} を削除
   */
  async deleteFile(bucket: R2Bucket, slug: string, path: string): Promise<void> {
    await storage.delete(bucket, `${slug}/${path}`)
  },

  /**
   * タグ一括更新
   * - D1: project_tags を全DELETE後にINSERT
   */
  async setTags(db: D1Database, slug: string, tagIds: string[]): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()
    await projectRepository.setTags(db, project.id, tagIds)
  },

  /**
   * タグ個別追加
   * - D1: project_tags にINSERT
   */
  async addTag(db: D1Database, slug: string, tagId: string): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()
    await projectRepository.addTag(db, project.id, tagId)
  },

  /**
   * タグ個別削除
   * - D1: project_tags をDELETE
   */
  async removeTag(db: D1Database, slug: string, tagId: string): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()
    await projectRepository.removeTag(db, project.id, tagId)
  },
}