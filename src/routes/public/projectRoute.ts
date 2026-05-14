import { Hono, type Context } from 'hono'
import { projectService, type ProjectQuery } from '../../services/projects'
import { NotFoundError } from '../../lib/errors'

const projectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧
projectRoute.get('/', async (c) => {
  const query = parseProjectQuery(c)
  return c.json(await projectService.getAll(c.env.SCD_DB, query))
})

// プロジェクト個別（index.md + index.json）
projectRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const result = await projectService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// フォルダ内のindex.json取得
projectRoute.get('/:slug/folders', async (c) => {
  const slug = c.req.param('slug')
  const result = await projectService.getFolders(c.env.SCD_CONTENTS, slug)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// ファイル取得
projectRoute.get('/:slug/files/*', async (c) => {
  const slug = c.req.param('slug')
  const path = c.req.param('*')
  if (!path) throw new NotFoundError()
  const result = await projectService.getFile(c.env.SCD_CONTENTS, slug, path)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// クエリパラメータのパース
function parseProjectQuery(c: Context<{ Bindings: CloudflareBindings }>): ProjectQuery {
  return {
    q: c.req.query('q'),
    q_match: (c.req.query('q_match') as ProjectQuery['q_match']) ?? 'partial',
    tags: c.req.queries('tag'),
    tag_match: (c.req.query('tag_match') as ProjectQuery['tag_match']) ?? 'exact',
    date_from: c.req.query('date_from'),
    date_to: c.req.query('date_to'),
  }
}

export default projectRoute