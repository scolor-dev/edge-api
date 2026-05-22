import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import type { TagItem } from "../new/+page.server"
import { apiHeaders, getBase } from "$lib/server/api"

type Tag = { id: string; name: string; slug: string }
type Status = "published" | "draft" | "private" | "archived"

type IndexFileEntry = {
	title: string
	uuid: string
	description?: string
	date?: string
	tags: string[]
}

type IndexFolderEntry = {
	title: string
	description?: string
	date?: string
	tags: string[]
}

export type IndexJson = {
	files: Record<string, IndexFileEntry>
	folders: Record<string, IndexFolderEntry>
	siblings: Record<string, { label: string; description?: string }>
}

export type ProjectDetail = {
	id: string
	title: string
	slug: string
	status: Status
	date: string | null
	description: string | null
	body: string | null
	links: string | null
	keywords: string | null
	readme: string | null
	index: IndexJson | null
	has_index: 0 | 1
	deleted_at: string | null
	created_at: string
	updated_at: string
	tags: Tag[]
}

export const load: PageServerLoad = async ({ platform, params, locals }) => {
	const base = getBase(platform)
	const [project, tags] = await Promise.all([
		fetch(`${base}/admin/projects/${params.slug}`, { headers: apiHeaders(locals) }).then((r) => {
			if (r.status === 404) error(404, "Project not found")
			return r.json() as Promise<ProjectDetail>
		}),
		fetch(`${base}/admin/tags`, { headers: apiHeaders(locals) }).then((r) => r.json() as Promise<TagItem[]>),
	])
	return { project, tags }
}

export const actions: Actions = {
	update: async ({ request, platform, params, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()

		const newSlug = data.get("slug") as string
		const tagIds = data.getAll("tagIds") as string[]
		const initDocs = data.get("initDocs") === "on"

		const siblingsRaw = data.get("siblings") as string | null
		let siblings: IndexJson["siblings"] | undefined
		try {
			if (siblingsRaw) siblings = JSON.parse(siblingsRaw)
		} catch {
			// ignore malformed JSON
		}

		const body = {
			title: data.get("title"),
			slug: newSlug !== params.slug ? newSlug : undefined,
			status: data.get("status"),
			date: data.get("date") || undefined,
			description: data.get("description") || undefined,
			body: data.get("body") || undefined,
			links: data.get("links") || undefined,
			keywords: data.get("keywords") || undefined,
			content: data.get("content") || undefined,
			tagIds,
			initDocs: initDocs || undefined,
			siblings,
		}

		const res = await fetch(`${base}/admin/projects/${params.slug}`, {
			method: "PATCH",
			headers: apiHeaders(locals),
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
		if (newSlug !== params.slug) redirect(303, `/projects/${newSlug}`)
	},

	delete: async ({ platform, params, locals }) => {
		const base = getBase(platform)
		const res = await fetch(`${base}/admin/projects/${params.slug}`, { method: "DELETE", headers: apiHeaders(locals) })
		if (!res.ok) return fail(res.status, { message: await res.text() })
		redirect(303, "/projects")
	},
}
