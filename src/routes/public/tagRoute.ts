import { Hono } from "hono"
import { tagService } from "../../services/tags"

const tagRoute = new Hono<{ Bindings: CloudflareBindings }>()

// タグ一覧（?format=group でカテゴリグループ化）
tagRoute.get("/", async (c) => {
	if (c.req.query("format") === "group") {
		return c.json(await tagService.getAllGrouped(c.env.SCD_DB))
	}
	return c.json(await tagService.getAll(c.env.SCD_DB))
})

export default tagRoute
