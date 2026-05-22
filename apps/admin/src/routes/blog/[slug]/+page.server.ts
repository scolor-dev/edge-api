import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"
import type { PostDetail, TagItem } from "$lib/types"

export type { PostDetail }

export const load: PageServerLoad = async ({ platform, params, locals }) => {
	const base = getBase(platform)
	const [post, tags] = await Promise.all([
		fetch(`${base}/admin/posts/${params.slug}`, { headers: apiHeaders(locals) }).then((r) => {
			if (r.status === 404) error(404, "Post not found")
			return r.json() as Promise<PostDetail>
		}),
		fetch(`${base}/admin/tags`, { headers: apiHeaders(locals) }).then((r) => r.json() as Promise<TagItem[]>),
	])
	return { post, tags }
}

export const actions: Actions = {
	update: async ({ request, platform, params, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()

		const newSlug = data.get("slug") as string
		const tagIds = data.getAll("tagIds") as string[]

		const body = {
			title: data.get("title"),
			slug: newSlug !== params.slug ? newSlug : undefined,
			status: data.get("status"),
			date: data.get("date") || undefined,
			thumbnail: data.get("thumbnail") || undefined,
			description: data.get("description") || undefined,
			body: data.get("body") || undefined,
			keywords: data.get("keywords") || undefined,
			content: data.get("content") || undefined,
			tagIds,
		}

		const res = await fetch(`${base}/admin/posts/${params.slug}`, {
			method: "PATCH",
			headers: apiHeaders(locals),
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
		if (newSlug !== params.slug) redirect(303, `/blog/${newSlug}`)
	},

	delete: async ({ platform, params, locals }) => {
		const base = getBase(platform)
		const res = await fetch(`${base}/admin/posts/${params.slug}`, { method: "DELETE", headers: apiHeaders(locals) })
		if (!res.ok) return fail(res.status, { message: await res.text() })
		redirect(303, "/blog")
	},
}
