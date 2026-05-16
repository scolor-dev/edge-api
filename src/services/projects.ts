// src/services/projects.ts

import { projectRepository } from '../repositories/projects'
import { storage } from '../lib/storage'
import { NotFoundError, AppError } from '../lib/errors'

export interface ProjectQuery {
  q?: string
  q_match?: 'exact' | 'partial'
  tags?: string[]
  tag_match?: 'exact' | 'partial'
  date_from?: string
  date_to?: string
  status?: 'published' | 'draft' | 'private' | 'archived'
  deleted?: 'true' | 'false' | 'all'
}

export interface CreateProjectInput {
  title: string
  slug: string
  thumbnail?: string
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
   * - publicは published・deleted=false のみ
   */
  async getAll(db: D1Database, query: ProjectQuery) {
    return await projectRepository.getAll(db, {
      ...query,
      status: query.status ?? 'published',
      deleted: query.deleted ?? 'false',
    })
  },

  /**
   * プロジェクト個別取得
   * - D1: projects + tags をJOIN
   * - R2(SCD_CONTENTS): {id}/README.md を取得
   */
  async getBySlug(db: D1Database, bucket: R2Bucket, slug: string, includeDeleted = false) {
    const project = await projectRepository.getBySlug(db, slug, includeDeleted)
    if (!project) return null

    const readme = await storage.getText(bucket, `${project.id}/README.md`)

    return { ...project, readme }
  },

  // ===========================
  // admin
  // ===========================

  /**
   * プロジェクト作成
   * - D1: slugの重複チェック
   * - D1: projects にINSERT（has_index: 0）
   * - D1: project_tags にINSERT（tagIdsがある場合）
   * - R2(SCD_CONTENTS): {id}/README.md をPUT（contentがある場合）
   */
  async create(db: D1Database, bucket: R2Bucket, data: CreateProjectInput): Promise<{ id: string }> {
    const exists = await projectRepository.existsBySlug(db, data.slug)
    if (exists) throw new AppError('slug already exists', 409)

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await projectRepository.create(db, {
      id,
      has_index: 0,
      title: data.title,
      slug: data.slug,
      thumbnail: data.thumbnail ?? null,
      description: data.description ?? null,
      links: data.links ?? null,
      keywords: data.keywords ?? null,
      date: data.date ?? now,
      status: data.status ?? 'draft',
    })

    if (data.content) {
      await storage.putText(bucket, `${id}/README.md`, data.content)
    }

    if (data.tagIds && data.tagIds.length > 0) {
      await projectRepository.setTags(db, id, data.tagIds)
    }

    return { id }
  },

  /**
   * プロジェクト更新（PATCH）
   * - D1: slug変更時に重複チェック
   * - D1: projects を差分UPDATE
   * - D1: project_tags を一括更新（tagIdsがある場合）
   * - R2(SCD_CONTENTS): {id}/README.md をPUT（contentがある場合）
   * - slug変更時はD1のslugのみ更新・R2のパスはidで固定のため移動不要
   */
  async update(db: D1Database, bucket: R2Bucket, slug: string, data: UpdateProjectInput): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()

    if (data.slug && data.slug !== slug) {
      const exists = await projectRepository.existsBySlug(db, data.slug, project.id)
      if (exists) throw new AppError('slug already exists', 409)
    }

    if (data.content) {
      await storage.putText(bucket, `${project.id}/README.md`, data.content)
    }

    const { content, tagIds, ...rest } = data
    await projectRepository.patch(db, project.id, rest)

    if (tagIds) {
      await projectRepository.setTags(db, project.id, tagIds)
    }
  },

  /**
   * プロジェクト削除（論理削除）
   * - D1: deleted_atをセット・delete_afterに30日後をセット
   * - R2は削除しない（delete_after到達後にCron Triggersで物理削除）
   */
  async delete(db: D1Database, slug: string): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()

    await projectRepository.softDelete(db, project.id)
  },
}