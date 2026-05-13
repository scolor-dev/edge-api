export interface TreeParams {
  path?: string
  q?: string
  q_match?: 'exact' | 'partial'
  tags?: string[]
  tag_match?: 'exact' | 'partial'
  recursive?: boolean
  status?: 'published' | 'draft' | 'private' | 'archived'
  date_from?: string
  date_to?: string
}

export const projectService = {
  async getAll(db: D1Database): Promise<unknown[]> {
    // TODO
    return []
  },

  async getTree(db: D1Database, params: TreeParams): Promise<unknown | null> {
    // TODO
    return null
  },

  async getFile(db: D1Database, bucket: R2Bucket, path: string): Promise<unknown | null> {
    // TODO
    return null
  },

  async create(db: D1Database, bucket: R2Bucket, data: unknown): Promise<unknown> {
    // TODO
    return null
  },

  async update(db: D1Database, bucket: R2Bucket, id: string, data: unknown): Promise<unknown> {
    // TODO
    return null
  },

  async delete(db: D1Database, bucket: R2Bucket, id: string): Promise<void> {
    // TODO
  },
}