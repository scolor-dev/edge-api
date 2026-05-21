import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import type { TagItem } from "../../projects/new/+page.server"

const getBase = (platform: App.Platform | undefined) =>
	platform?.env?.API_BASE_URL ?? "http://localhost:8787/api"

type Tag = { id: string; name: string; slug: string }
type Status = "published" | "draft" | "private" | "archived"

export type PostDetail = {
	id: string
	title: string
	slug: string
	status: Status
	date: string | null
	thumbnail: string | null
	description: string | null
	body: string | null
	keywords: string | null
	readme: string | null
	has_index: 0 | 1
	deleted_at: string | null
	created_at: string
	updated_at: string
	tags: Tag[]
}

export const load: PageServerLoad = async ({ platform, params }) => {
	const base = getBase(platform)
	const [post, tags] = await Promise.all([
		fetch(`${base}/admin/posts/${params.slug}`).then((r) => {
			if (r.status === 404) error(404, "Post not found")
			return r.json() as Promise<PostDetail>
		}),
		fetch(`${base}/admin/tags`).then((r) => r.json() as Promise<TagItem[]>),
	])
	return { post, tags }
}

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
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
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
		if (newSlug !== params.slug) redirect(303, `/blog/${newSlug}`)
	},

	delete: async ({ platform, params }) => {
		const base = getBase(platform)
		const res = await fetch(`${base}/admin/posts/${params.slug}`, { method: "DELETE" })
		if (!res.ok) return fail(res.status, { message: await res.text() })
		redirect(303, "/blog")
	},
}
