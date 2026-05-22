export type Tag = { id: string; name: string; slug: string }

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

export type ProjectDetail = Project & {
	readme: string | null
	index: unknown
}
