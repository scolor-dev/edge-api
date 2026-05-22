import type { PageServerLoad } from './$types'

type Tag = { id: string; name: string; slug: string }

export type Project = {
	id: string
	title: string
	slug: string
	date: string
	description: string | null
	links: string | null
	keywords: string | null
	has_index: 0 | 1
	tags: Tag[]
}

export const load: PageServerLoad = async ({ platform, url }) => {
	const base = platform?.env?.API_BASE_URL ?? 'http://localhost:8787/api'
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
