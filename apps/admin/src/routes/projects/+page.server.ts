import { fail } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { apiHeaders, getBase } from "$lib/server/api"
import type { Project } from "$lib/types"

export type { Project }

export const load: PageServerLoad = async ({ platform, locals }) => {
	const base = getBase(platform)
	const projects = await fetch(`${base}/admin/projects`, { headers: apiHeaders(locals) }).then(
		(r) => r.json() as Promise<Project[]>,
	)
	return { projects }
}

export const actions: Actions = {
	delete: async ({ request, platform, locals }) => {
		const base = getBase(platform)
		const data = await request.formData()
		const slug = data.get("slug") as string
		const res = await fetch(`${base}/admin/projects/${slug}`, { method: "DELETE", headers: apiHeaders(locals) })
		if (!res.ok) return fail(res.status, { message: await res.text() })
	},
}
