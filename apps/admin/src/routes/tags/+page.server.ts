import { fail } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"

type Category = { id: string; name: string; slug: string }
type Tag = { id: string; name: string; slug: string; category_id: string | null; category_name: string | null }

export const load: PageServerLoad = async ({ platform, locals }) => {
	const base = getBase(platform)
	const [categories, tags] = await Promise.all([
		fetch(`${base}/admin/tags/categories`, { headers: apiHeaders(locals) }).then((r) => r.json() as Promise<Category[]>),
		fetch(`${base}/admin/tags`, { headers: apiHeaders(locals) }).then((r) => r.json() as Promise<Tag[]>),
	])
	return { categories, tags }
}

export const actions: Actions = {
	createCategory: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const res = await fetch(`${base}/admin/tags/categories`, {
			method: "POST",
			headers: apiHeaders(locals),
			body: JSON.stringify({ name: data.get("name"), slug: data.get("slug") }),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	updateCategory: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const id = data.get("id") as string
		const res = await fetch(`${base}/admin/tags/categories/${id}`, {
			method: "PATCH",
			headers: apiHeaders(locals),
			body: JSON.stringify({ name: data.get("name"), slug: data.get("slug") }),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	deleteCategory: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const res = await fetch(`${base}/admin/tags/categories/${data.get("id")}`, {
			method: "DELETE",
			headers: apiHeaders(locals),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	createTag: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const category_id = data.get("category_id") || undefined
		const res = await fetch(`${base}/admin/tags`, {
			method: "POST",
			headers: apiHeaders(locals),
			body: JSON.stringify({ name: data.get("name"), slug: data.get("slug"), category_id }),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	updateTag: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const id = data.get("id") as string
		const category_id = data.get("category_id") || null
		const res = await fetch(`${base}/admin/tags/${id}`, {
			method: "PATCH",
			headers: apiHeaders(locals),
			body: JSON.stringify({ name: data.get("name"), slug: data.get("slug"), category_id }),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	deleteTag: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const res = await fetch(`${base}/admin/tags/${data.get("id")}`, {
			method: "DELETE",
			headers: apiHeaders(locals),
		})
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},
}
