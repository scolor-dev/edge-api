import { error } from '@sveltejs/kit'
import { getBase } from '$lib/server/api'
import type { ProjectDetail } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ platform, params }) => {
	const base = getBase(platform)
	const res = await fetch(`${base}/projects/${params.slug}`)
	if (res.status === 404) throw error(404, 'Not found')
	if (!res.ok) throw error(500, 'Failed to fetch project')

	const data: ProjectDetail = await res.json()

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
	}
}
