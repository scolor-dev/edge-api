import { type Context, Hono } from "hono"
import { NotFoundError } from "../../lib/errors"
import { type ProjectQuery, projectService } from "../../services/projects"

const adminProjectRoute = new Hono<{ Bindings: CloudflareBindings }>()

// プロジェクト一覧（admin は status・deleted 絞り込み可）
adminProjectRoute.get("/", async (c) => {
	const query = parseProjectQuery(c)
	return c.json(await projectService.getAll(c.env.SCD_DB, query))
})

// プロジェクト作成
adminProjectRoute.post("/", async (c) => {
	const body = await c.req.json()
	const result = await projectService.create(c.env.SCD_DB, c.env.SCD_CONTENTS, body)
	return c.json(result, 201)
})

// プロジェクト個別（論理削除済みも取得可）
adminProjectRoute.get("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const result = await projectService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, true)
	if (!result) throw new NotFoundError()
	return c.json(result)
})

// プロジェクト更新
adminProjectRoute.patch("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const body = await c.req.json()
	await projectService.update(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, body)
	return c.json({ success: true })
})

// プロジェクト削除（論理削除）
adminProjectRoute.delete("/:slug", async (c) => {
	const slug = c.req.param("slug")
	await projectService.delete(c.env.SCD_DB, slug)
	return c.json({ success: true })
})

// プロジェクト内ファイル取得
adminProjectRoute.get("/:slug/:fileId", async (c) => {
	const { slug, fileId } = c.req.param()
	const result = await projectService.getFile(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, fileId)
	return c.json(result)
})

// プロジェクト内ファイル追加（has_index=1 のプロジェクトのみ）
adminProjectRoute.post("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const body = await c.req.json()
	const result = await projectService.addFile(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, body)
	return c.json(result, 201)
})

// プロジェクト内ファイル編集
adminProjectRoute.patch("/:slug/:fileId", async (c) => {
	const { slug, fileId } = c.req.param()
	const body = await c.req.json()
	await projectService.updateFile(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, fileId, body)
	return c.json({ success: true })
})

// プロジェクト内ファイル削除
adminProjectRoute.delete("/:slug/:fileId", async (c) => {
	const { slug, fileId } = c.req.param()
	await projectService.deleteFile(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, fileId)
	return c.json({ success: true })
})

function parseProjectQuery(c: Context<{ Bindings: CloudflareBindings }>): ProjectQuery {
	return {
		q: c.req.query("q"),
		q_match: (c.req.query("q_match") as ProjectQuery["q_match"]) ?? "partial",
		tags: c.req.queries("tag"),
		tag_match: (c.req.query("tag_match") as ProjectQuery["tag_match"]) ?? "exact",
		date_from: c.req.query("date_from"),
		date_to: c.req.query("date_to"),
		status: c.req.query("status") as ProjectQuery["status"],
		deleted: c.req.query("deleted") as ProjectQuery["deleted"],
	}
}

export default adminProjectRoute
