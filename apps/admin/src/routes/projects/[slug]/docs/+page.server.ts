import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

const getBase = (platform: App.Platform | undefined) =>
	platform?.env?.API_BASE_URL ?? "http://localhost:8787/api"

type IndexJson = {
	files: Record<string, { title: string; uuid: string; description?: string; date?: string; tags: string[] }>
	folders: Record<string, { title: string; description?: string; date?: string; tags: string[] }>
	siblings: Record<string, { label: string; description?: string }>
}

type Project = {
	id: string
	title: string
	slug: string
	has_index: 0 | 1
	index: IndexJson | null
}

type SelectedFile = {
	path: string
	meta: { title: string; uuid: string; description?: string; date?: string; tags: string[] }
	content: string | null
}

export const load: PageServerLoad = async ({ platform, params, url }) => {
	const base = getBase(platform)

	const project = await fetch(`${base}/admin/projects/${params.slug}`).then((r) => {
		if (r.status === 404) error(404, "Project not found")
		return r.json() as Promise<Project>
	})

	if (!project.has_index) redirect(303, `/projects/${params.slug}`)

	const fileId = url.searchParams.get("file")
	let selectedFile: SelectedFile | null = null

	if (fileId) {
		const r = await fetch(`${base}/admin/projects/${params.slug}/${fileId}`)
		if (r.ok) selectedFile = (await r.json()) as SelectedFile
	}

	return { project, selectedFileId: fileId, selectedFile }
}

export const actions: Actions = {
	addFile: async ({ request, platform, params }) => {
		const base = getBase(platform)
		const data = await request.formData()

		const body = {
			path: data.get("path"),
			type: data.get("type") || "file",
			title: data.get("title"),
			description: (data.get("description") as string) || undefined,
			content: (data.get("content") as string) || undefined,
		}

		const res = await fetch(`${base}/admin/projects/${params.slug}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
		const result = (await res.json()) as { uuid?: string }
		return { uuid: result.uuid }
	},

	updateFile: async ({ request, platform, params }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const fileId = data.get("fileId") as string

		const body = {
			title: (data.get("title") as string) || undefined,
			content: data.get("content") as string,
		}

		const res = await fetch(`${base}/admin/projects/${params.slug}/${fileId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	deleteFile: async ({ request, platform, params }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const fileId = data.get("fileId") as string

		const res = await fetch(`${base}/admin/projects/${params.slug}/${fileId}`, {
			method: "DELETE",
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	updateFolder: async ({ request, platform, params }) => {
		const base = getBase(platform)
		const data = await request.formData()

		const body = {
			path: data.get("folderPath") as string,
			title: (data.get("title") as string) || undefined,
		}

		const res = await fetch(`${base}/admin/projects/${params.slug}/folder`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!res.ok) return fail(res.status, { message: await res.text() })
	},

	deleteFolder: async ({ request, platform, params }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const folderPath = data.get("folderPath") as string

		const res = await fetch(
			`${base}/admin/projects/${params.slug}/folder?path=${encodeURIComponent(folderPath)}`,
			{ method: "DELETE" },
		)

		if (!res.ok) return fail(res.status, { message: await res.text() })
	},
}
