import { type Context, Hono } from "hono"
import { NotFoundError } from "../../lib/errors"
import { type PostQuery, postService } from "../../services/posts"

const postRoute = new Hono<{ Bindings: CloudflareBindings }>()

// ブログ一覧（pub のみ・クエリ絞り込み対応）
postRoute.get("/", async (c) => {
	const query = parsePostQuery(c)
	return c.json(await postService.getAll(c.env.SCD_DB, query))
})

// ブログ個別（MD + メタ情報）
postRoute.get("/:slug", async (c) => {
	const slug = c.req.param("slug")
	const result = await postService.getBySlug(c.env.SCD_DB, c.env.SCD_CONTENTS, slug)
	if (!result) throw new NotFoundError()
	return c.json(result)
})

function parsePostQuery(c: Context<{ Bindings: CloudflareBindings }>): PostQuery {
	return {
		q: c.req.query("q"),
		q_match: (c.req.query("q_match") as PostQuery["q_match"]) ?? "partial",
		tags: c.req.queries("tag"),
		tag_match: (c.req.query("tag_match") as PostQuery["tag_match"]) ?? "exact",
		date_from: c.req.query("date_from"),
		date_to: c.req.query("date_to"),
	}
}

export default postRoute
