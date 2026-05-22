import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

type Tag = { id: string; name: string; slug: string }

export type ProjectMeta = {
	id: string
	title: string
	slug: string
	date: string
	description: string | null
	links: string | null
	keywords: string | null
	has_index: 0 | 1
	tags: Tag[]
	readme: string | null
}

export const load: PageServerLoad = async ({ platform, params }) => {
	const base = platform?.env?.API_BASE_URL ?? 'http://localhost:8787/api'
	const res = await fetch(`${base}/projects/${params.slug}`)
	if (res.status === 404) throw error(404, 'Not found')
	if (!res.ok) throw error(500, 'Failed to fetch project')

	const data = await res.json<ProjectMeta & { index: unknown }>()

	return {
		id: data.id,
		title: data.title,
		slug: data.slug,
		date: data.date,
		description: data.description,
		links: data.links,
		keywords: data.keywords,
		has_index: data.has_index,
		tags: data.tags,
		readme: data.readme,
	} satisfies ProjectMeta
}
