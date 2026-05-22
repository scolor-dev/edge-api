import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"

type Tag = { id: string; name: string; slug: string }
type Status = "published" | "draft" | "private" | "archived"

export type Post = {
	id: string
	title: string
	slug: string
	status: Status
	date: string | null
	thumbnail: string | null
	description: string | null
	body: string | null
	keywords: string | null
	has_index: 0 | 1
	deleted_at: string | null
	delete_after: string | null
	created_at: string
	updated_at: string
	tags: Tag[]
}

export const load: PageServerLoad = async ({ platform, locals }) => {
	const base = getBase(platform)
	const posts = await fetch(`${base}/admin/posts?deleted=false`, { headers: apiHeaders(locals) }).then(
		(r) => r.json() as Promise<Post[]>,
	)
	return { posts }
}

export const actions: Actions = {
	delete: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const slug = data.get("slug") as string

		const res = await fetch(`${base}/admin/posts/${slug}`, { method: "DELETE", headers: apiHeaders(locals) })
		if (!res.ok) return fail(res.status, { message: await res.text() })
		redirect(303, "/blog")
	},
}
