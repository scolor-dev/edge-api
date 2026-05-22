import { getBase } from '$lib/server/api'
import type { Project, Tag } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ platform, url }) => {
	const base = getBase(platform)
	const tag = url.searchParams.get('tag') ?? undefined

	const query = new URLSearchParams()
	if (tag) query.set('tag', tag)

	const [projectsRes, tagsRes] = await Promise.all([
		fetch(`${base}/projects?${query}`),
		fetch(`${base}/tags`),
	])

	const projects: Project[] = projectsRes.ok ? await projectsRes.json() : []
	const tags: Tag[] = tagsRes.ok ? await tagsRes.json() : []

	return { projects, tags, selectedTag: tag ?? null }
}
