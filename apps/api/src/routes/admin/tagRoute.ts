import { Hono } from "hono"
import { ConflictError } from "../../lib/errors"
import { tagCategoryService, tagService } from "../../services/tags"

const adminTagRoute = new Hono<{ Bindings: CloudflareBindings }>()

const isUniqueError = (err: unknown) =>
	err instanceof Error && err.message.includes("UNIQUE constraint failed")

// =========================================================
// Tags
// =========================================================

// タグ一覧（?format=group でカテゴリグループ化）
adminTagRoute.get("/", async (c) => {
	if (c.req.query("format") === "group") {
		return c.json(await tagService.getAllGrouped(c.env.SCD_DB))
	}
	return c.json(await tagService.getAll(c.env.SCD_DB))
})

// タグ作成
adminTagRoute.post("/", async (c) => {
	const { name, slug, category_id } = await c.req.json<{
		name: string
		slug: string
		category_id?: string
	}>()
	try {
		const result = await tagService.create(c.env.SCD_DB, { name, slug, category_id })
		return c.json(result, 201)
	} catch (err) {
		if (isUniqueError(err)) throw new ConflictError(`Slug "${slug}" is already in use`)
		throw err
	}
})

// タグ編集
adminTagRoute.patch("/:id", async (c) => {
	const id = c.req.param("id")
	const { name, slug, category_id } = await c.req.json<{
		name: string
		slug: string
		category_id?: string | null
	}>()
	try {
		await tagService.update(c.env.SCD_DB, id, { name, slug, category_id })
		return c.json({ success: true })
	} catch (err) {
		if (isUniqueError(err)) throw new ConflictError(`Slug "${slug}" is already in use`)
		throw err
	}
})

// タグ削除
adminTagRoute.delete("/:id", async (c) => {
	const id = c.req.param("id")
	await tagService.delete(c.env.SCD_DB, id)
	return c.json({ success: true })
})

// =========================================================
// Categories（/categories サブリソース）
// =========================================================

// カテゴリ一覧
adminTagRoute.get("/categories", async (c) => {
	return c.json(await tagCategoryService.getAll(c.env.SCD_DB))
})

// カテゴリ作成
adminTagRoute.post("/categories", async (c) => {
	const { name, slug } = await c.req.json<{ name: string; slug: string }>()
	try {
		const result = await tagCategoryService.create(c.env.SCD_DB, { name, slug })
		return c.json(result, 201)
	} catch (err) {
		if (isUniqueError(err)) throw new ConflictError(`Slug "${slug}" is already in use`)
		throw err
	}
})

// カテゴリ編集
adminTagRoute.patch("/categories/:id", async (c) => {
	const id = c.req.param("id")
	const { name, slug } = await c.req.json<{ name: string; slug: string }>()
	try {
		await tagCategoryService.update(c.env.SCD_DB, id, { name, slug })
		return c.json({ success: true })
	} catch (err) {
		if (isUniqueError(err)) throw new ConflictError(`Slug "${slug}" is already in use`)
		throw err
	}
})

// カテゴリ削除（配下タグの category_id は NULL に）
adminTagRoute.delete("/categories/:id", async (c) => {
	const id = c.req.param("id")
	await tagCategoryService.delete(c.env.SCD_DB, id)
	return c.json({ success: true })
})

export default adminTagRoute
