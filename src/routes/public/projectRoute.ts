import { Hono, type Context } from 'hono'
import { projectService, type TreeParams } from '../../services/projects'
import { NotFoundError } from '../../lib/errors'

const projectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧
projectRoute.get('/', async (c) => {
  return c.json(await projectService.getAll(c.env.SCD_DB))
})

// 配下フォルダ
projectRoute.get('/tree/*', async (c) => {
  const params = parseTreeParams(c, c.req.param('*'))
  const result = await projectService.getTree(c.env.SCD_DB, params)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// ファイル取得
projectRoute.get('/files/*', async (c) => {
  const path = c.req.param('*')
  if (!path) throw new NotFoundError()
  const result = await projectService.getFile(c.env.SCD_DB, c.env.SCD_CONTENTS, path)
  if (!result) throw new NotFoundError()
  return c.json(result)
})

// クエリパラメータのパース（共通）
function parseTreeParams(c: Context<{ Bindings: CloudflareBindings }>, path?: string): TreeParams {
  return {
    path,
    q: c.req.query('q'),
    q_match: (c.req.query('q_match') as TreeParams['q_match']) ?? 'partial',
    tags: c.req.queries('tag'),
    tag_match: (c.req.query('tag_match') as TreeParams['tag_match']) ?? 'exact',
    recursive: c.req.query('recursive') === 'true',
    date_from: c.req.query('date_from'),
    date_to: c.req.query('date_to'),
  }
}

export default projectRoute