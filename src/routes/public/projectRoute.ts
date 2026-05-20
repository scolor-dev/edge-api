import { type Context, Hono } from "hono"
import { NotFoundError } from "../../lib/errors"
import { type ProjectQuery, projectService } from "../../services/projects"

const projectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧
projectRoute.get("/", async (c) => {
	const query = parseProjectQuery(c)
	return c.json(await projectService.getAll(c.env.SCD_DB, query))
})

// プロジェクト個別（README.md + index.json + メタ情報）
projectRoute.get("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const result = await projectService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug)
	if (!result) throw new NotFoundError()
	return c.json(result)
})

// プロジェクト内ファイル取得
projectRoute.get("/:slug/:fileId", async (c) => {
	const { slug, fileId } = c.req.param()
	const result = await projectService.getFile(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, fileId)
	return c.json(result)
})

function parseProjectQuery(c: Context<{ Bindings: CloudflareBindings }>): ProjectQuery {
	return {
		q: c.req.query("q"),
		q_match: (c.req.query("q_match") as ProjectQuery["q_match"]) ?? "partial",
		tags: c.req.queries("tag"),
		tag_match: (c.req.query("tag_match") as ProjectQuery["tag_match"]) ?? "exact",
		date_from: c.req.query("date_from"),
		date_to: c.req.query("date_to"),
	}
}

export default projectRoute
