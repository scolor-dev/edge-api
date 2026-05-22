import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"
import type { IndexJson, TagItem } from "$lib/types"

export type { TagItem }

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
		const initDocs = data.get("initDocs") === "on"

		const siblingsRaw = data.get("siblings") as string | null
		let siblings: IndexJson["siblings"] | undefined
		try {
			if (siblingsRaw) {
				const parsed = JSON.parse(siblingsRaw)
				if (Object.keys(parsed).length > 0) siblings = parsed
			}
		} catch (e) {
			console.error("Failed to parse siblings JSON:", e)
		}

		const body = {
			title: data.get("title"),
			slug,
			status: data.get("status") || "draft",
			date: data.get("date") || undefined,
			description: data.get("description") || undefined,
			body: data.get("body") || undefined,
			links: data.get("links") || undefined,
			keywords: data.get("keywords") || undefined,
			content: data.get("content") || undefined,
			tagIds: tagIds.length > 0 ? tagIds : undefined,
			initDocs: initDocs || undefined,
			siblings,
		}

		const res = await fetch(`${base}/admin/projects`, {
			method: "POST",
			headers: apiHeaders(locals),
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })

		redirect(303, `/projects/${slug}`)
	},
}
