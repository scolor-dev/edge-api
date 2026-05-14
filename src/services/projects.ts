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

export interface FolderStructure {
  folders: { name: string; path: string; order: number }[]
  files: { name: string; path: string; order: number }[]
}

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
   * - R2(SCD_CONTENTS): {slug}/README.md を取得
   * - R2(SCD_CONTENTS): {slug}/index.json を取得（type === 'docs'のみ）
   */
  async getBySlug(db: D1Database, bucket: R2Bucket, slug: string) {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) return null

    const readme = await storage.getText(bucket, `${slug}/README.md`)

    let folders = null
    if (project.type === 'docs') {
      folders = await storage.getJson<FolderStructure>(bucket, `${slug}/index.json`)
    }

    return { ...project, readme, folders }
  },

  /**
   * フォルダ構造取得
   * - R2(SCD_CONTENTS): {slug}/index.json を取得してパース
   */
  async getFolders(bucket: R2Bucket, slug: string) {
    return await storage.getJson<FolderStructure>(bucket, `${slug}/index.json`)
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
   * - R2(SCD_CONTENTS): {slug}/README.md をPUT（contentがある場合）
   * - R2(SCD_CONTENTS): {slug}/index.json をPUT（type === 'docs'の場合）
   */
  async create(db: D1Database, bucket: R2Bucket, data: CreateProjectInput): Promise<{ id: string }> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    if (data.content) {
      await storage.putText(bucket, `${data.slug}/README.md`, data.content)
    }

    if (data.type === 'docs') {
      await storage.putJson(bucket, `${data.slug}/index.json`, { folders: [], files: [] })
    }

    await projectRepository.create(db, {
      id,
      type: data.type,
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      links: data.links ?? null,
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
   * - R2(SCD_CONTENTS): README.md をPUT（contentがある場合）
   * - R2(SCD_CONTENTS): slug変更時にsimpleはREADME.mdのみ移動、docsは配下を全移動
   */
  async update(db: D1Database, bucket: R2Bucket, slug: string, data: UpdateProjectInput): Promise<void> {
    const project = await projectRepository.getBySlug(db, slug)
    if (!project) throw new NotFoundError()

    const newSlug = data.slug ?? slug

    // slug変更時にR2のファイルを移動
    if (data.slug && data.slug !== slug) {
      if (project.type === 'simple') {
        // README.mdのみ移動
        const oldReadme = await storage.getText(bucket, `${slug}/README.md`)
        if (oldReadme) {
          await storage.putText(bucket, `${newSlug}/README.md`, oldReadme)
          await storage.delete(bucket, `${slug}/README.md`)
        }
      } else {
        // docs：配下を全コピー→全削除
        await storage.copyAll(bucket, `${slug}/`, `${newSlug}/`)
        await storage.deleteAll(bucket, `${slug}/`)
      }
    }

    // contentが更新された場合
    if (data.content) {
      await storage.putText(bucket, `${newSlug}/README.md`, data.content)
    }

    const { content, tagIds, ...rest } = data
    await projectRepository.update(db, project.id, rest)

    if (tagIds) {
      await projectRepository.setTags(db, project.id, tagIds)
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
  async updateFolders(bucket: R2Bucket, slug: string, data: FolderStructure): Promise<void> {
    await storage.putJson(bucket, `${slug}/index.json`, data)
  },

  /**
   * ファイルアップロード
   * - R2(SCD_CONTENTS): {slug}/{path} にMDをPUT
   */
  async uploadFile(bucket: R2Bucket, slug: string, path: string, content: string): Promise<void> {
    await storage.putText(bucket, `${slug}/${path}`, content)
  },

  /**
   * ファイル移動
   * - R2(SCD_CONTENTS): 旧パスをコピー→削除
   * - R2(SCD_CONTENTS): index.jsonのpath更新
   */
  async moveFile(bucket: R2Bucket, slug: string, oldPath: string, newPath: string): Promise<void> {
    const content = await storage.getText(bucket, `${slug}/${oldPath}`)
    if (!content) throw new NotFoundError()

    await storage.putText(bucket, `${slug}/${newPath}`, content)
    await storage.delete(bucket, `${slug}/${oldPath}`)

    const structure = await storage.getJson<FolderStructure>(bucket, `${slug}/index.json`)
    if (structure) {
      structure.files = structure.files.map(f =>
        f.path === oldPath
          ? { ...f, path: newPath, name: newPath.split('/').pop() ?? f.name }
          : f
      )
      await storage.putJson(bucket, `${slug}/index.json`, structure)
    }
  },

  /**
   * フォルダ移動
   * - R2(SCD_CONTENTS): 旧プレフィックス配下を全コピー→全削除
   * - R2(SCD_CONTENTS): index.jsonのフォルダ・ファイルのpath更新
   */
  async moveFolder(bucket: R2Bucket, slug: string, oldPath: string, newPath: string): Promise<void> {
    await storage.copyAll(bucket, `${slug}/${oldPath}`, `${slug}/${newPath}`)
    await storage.deleteAll(bucket, `${slug}/${oldPath}`)

    const structure = await storage.getJson<FolderStructure>(bucket, `${slug}/index.json`)
    if (structure) {
      structure.folders = structure.folders.map(f =>
        f.path === oldPath
          ? { ...f, path: newPath, name: newPath.split('/').pop() ?? f.name }
          : f.path.startsWith(`${oldPath}/`)
            ? { ...f, path: f.path.replace(oldPath, newPath) }
            : f
      )
      structure.files = structure.files.map(f =>
        f.path.startsWith(`${oldPath}/`)
          ? { ...f, path: f.path.replace(oldPath, newPath) }
          : f
      )
      await storage.putJson(bucket, `${slug}/index.json`, structure)
    }
  },

  /**
   * ファイル削除
   * - R2(SCD_CONTENTS): {slug}/{path} を削除
   * - R2(SCD_CONTENTS): index.jsonからも削除
   */
  async deleteFile(bucket: R2Bucket, slug: string, path: string): Promise<void> {
    await storage.delete(bucket, `${slug}/${path}`)

    const structure = await storage.getJson<FolderStructure>(bucket, `${slug}/index.json`)
    if (structure) {
      structure.files = structure.files.filter(f => f.path !== path)
      await storage.putJson(bucket, `${slug}/index.json`, structure)
    }
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