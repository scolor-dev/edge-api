import { Hono, type Context } from 'hono'
import { projectService, type ProjectQuery } from '../../services/projects'
import { NotFoundError } from '../../lib/errors'

const adminProjectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧
adminProjectRoute.get('/', async (c) => {
  const query = parseProjectQuery(c)
  return c.json(await projectService.getAll(c.env.SCD_DB, query))
})

// プロジェクト個別
adminProjectRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const result = await projectService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// プロジェクト作成
adminProjectRoute.post('/', async (c) => {
  const body = await c.req.json()
  const result = await projectService.create(c.env.SCD_DB, c.env.SCD_CONTENTS, body)
  return c.json(result, 201)
})

// プロジェクト更新
adminProjectRoute.patch('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json()
  await projectService.update(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, body)
  return c.json({ success: true })
})

// プロジェクト削除
adminProjectRoute.delete('/:slug', async (c) => {
  const slug = c.req.param('slug')
  await projectService.delete(c.env.SCD_DB, c.env.SCD_CONTENTS, slug)
  return c.json({ success: true })
})

// フォルダ構造更新
adminProjectRoute.put('/:slug/folders', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json()
  await projectService.updateFolders(c.env.SCD_CONTENTS, slug, body)
  return c.json({ success: true })
})

// ファイルアップロード
adminProjectRoute.put('/:slug/files/*', async (c) => {
  const slug = c.req.param('slug')
  const path = c.req.param('*')
  if (!path) throw new NotFoundError()
  const body = await c.req.json()
  await projectService.uploadFile(c.env.SCD_CONTENTS, slug, path, body.content)
  return c.json({ success: true })
})

// ファイル削除
adminProjectRoute.delete('/:slug/files/*', async (c) => {
  const slug = c.req.param('slug')
  const path = c.req.param('*')
  if (!path) throw new NotFoundError()
  await projectService.deleteFile(c.env.SCD_CONTENTS, slug, path)
  return c.json({ success: true })
})

// タグ一括更新
adminProjectRoute.put('/:slug/tags', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json()
  await projectService.setTags(c.env.SCD_DB, slug, body.tagIds)
  return c.json({ success: true })
})

// タグ個別追加
adminProjectRoute.post('/:slug/tags/:tagId', async (c) => {
  const slug = c.req.param('slug')
  const tagId = c.req.param('tagId')
  await projectService.addTag(c.env.SCD_DB, slug, tagId)
  return c.json({ success: true }, 201)
})

// タグ個別削除
adminProjectRoute.delete('/:slug/tags/:tagId', async (c) => {
  const slug = c.req.param('slug')
  const tagId = c.req.param('tagId')
  await projectService.removeTag(c.env.SCD_DB, slug, tagId)
  return c.json({ success: true })
})

// クエリパラメータのパース（adminはstatusも対応）
function parseProjectQuery(c: Context<{ Bindings: CloudflareBindings }>): ProjectQuery {
  return {
    q: c.req.query('q'),
    q_match: (c.req.query('q_match') as ProjectQuery['q_match']) ?? 'partial',
    tags: c.req.queries('tag'),
    tag_match: (c.req.query('tag_match') as ProjectQuery['tag_match']) ?? 'exact',
    date_from: c.req.query('date_from'),
    date_to: c.req.query('date_to'),
    status: c.req.query('status') as ProjectQuery['status'],
  }
}

export default adminProjectRoute