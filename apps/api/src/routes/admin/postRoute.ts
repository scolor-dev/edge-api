import { type Context, Hono } from "hono"
import { NotFoundError } from "../../lib/errors"
import { type PostQuery, postService } from "../../services/posts"

const adminPostRoute = new Hono<{ Bindings: CloudflareBindings }>()

// ブログ一覧（admin は status・deleted 絞り込み可）
adminPostRoute.get("/", async (c) => {
	const query = parsePostQuery(c)
	return c.json(await postService.adminGetAll(c.env.SCD_DB, query))
})

// ブログ新規作成
adminPostRoute.post("/", async (c) => {
	const body = await c.req.json()
	const result = await postService.create(c.env.SCD_DB, c.env.SCD_CONTENTS, body)
	return c.json(result, 201)
})

// ブログ個別（論理削除済みも取得可）
adminPostRoute.get("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const result = await postService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, true)
	if (!result) throw new NotFoundError()
	return c.json(result)
})

// ブログ編集
adminPostRoute.patch("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const body = await c.req.json()
	await postService.update(c.env.SCD_DB, c.env.SCD_CONTENTS, slug, body)
	return c.json({ success: true })
})

// ブログ削除（論理削除）
adminPostRoute.delete("/:slug", async (c) => {
	const slug = c.req.param("slug")
	await postService.delete(c.env.SCD_DB, slug)
	return c.json({ success: true })
})

function parsePostQuery(c: Context<{ Bindings: CloudflareBindings }>): PostQuery {
	return {
		q: c.req.query("q"),
		q_match: (c.req.query("q_match") as PostQuery["q_match"]) ?? "partial",
		tags: c.req.queries("tag"),
		tag_match: (c.req.query("tag_match") as PostQuery["tag_match"]) ?? "exact",
		date_from: c.req.query("date_from"),
		date_to: c.req.query("date_to"),
		status: c.req.query("status") as PostQuery["status"],
		deleted: c.req.query("deleted") as PostQuery["deleted"],
	}
}

export default adminPostRoute
