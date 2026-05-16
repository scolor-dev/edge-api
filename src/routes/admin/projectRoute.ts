import { Hono, type Context } from 'hono'
import { projectService, type ProjectQuery } from '../../services/projects'
import { NotFoundError } from '../../lib/errors'

const adminProjectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧（adminはstatus・deleted絞り込み可）
adminProjectRoute.get('/', async (c) => {
  const query = parseProjectQuery(c)
  return c.json(await projectService.getAll(c.env.SCD_DB, query))
})

// プロジェクト個別（論理削除済みも取得可）
adminProjectRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const result = await projectService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, true)
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

// プロジェクト削除（論理削除）
adminProjectRoute.delete('/:slug', async (c) => {
  const slug = c.req.param('slug')
  await projectService.delete(c.env.SCD_DB, slug)
  return c.json({ success: true })
})

function parseProjectQuery(c: Context<{ Bindings: CloudflareBindings }>): ProjectQuery {
  return {
    q: c.req.query('q'),
    q_match: (c.req.query('q_match') as ProjectQuery['q_match']) ?? 'partial',
    tags: c.req.queries('tag'),
    tag_match: (c.req.query('tag_match') as ProjectQuery['tag_match']) ?? 'exact',
    date_from: c.req.query('date_from'),
    date_to: c.req.query('date_to'),
    status: c.req.query('status') as ProjectQuery['status'],
    deleted: c.req.query('deleted') as ProjectQuery['deleted'],
  }
}

export default adminProjectRoute