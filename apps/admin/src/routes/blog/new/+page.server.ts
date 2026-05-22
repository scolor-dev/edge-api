import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"
import type { TagItem } from "$lib/types"

export const load: PageServerLoad = async ({ platform, locals }) => {
	const base = getBase(platform)
	const tags = await fetch(`${base}/admin/tags`, { headers: apiHeaders(locals) }).then((r) => r.json() as Promise<TagItem[]>)
	return { tags }
}

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()

		const slug = data.get("slug") as string
		const tagIds = data.getAll("tagIds") as string[]

		const body = {
			title: data.get("title"),
			slug,
			status: data.get("status") || "draft",
			date: data.get("date") || undefined,
			thumbnail: data.get("thumbnail") || undefined,
			description: data.get("description") || undefined,
			body: data.get("body") || undefined,
			keywords: data.get("keywords") || undefined,
			content: data.get("content") || undefined,
			tagIds: tagIds.length > 0 ? tagIds : undefined,
		}

		const res = await fetch(`${base}/admin/posts`, {
			method: "POST",
			headers: apiHeaders(locals),
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })

		redirect(303, `/blog/${slug}`)
	},
}
