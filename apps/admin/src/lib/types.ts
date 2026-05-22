export type Status = "published" | "draft" | "private" | "archived"

export type Tag = { id: string; name: string; slug: string }

export type TagItem = {
	id: string
	name: string
	slug: string
	category_id: string | null
	category_name: string | null
}

export type Category = { id: string; name: string; slug: string }

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

export type IndexFileEntry = {
	title: string
	uuid: string
	description?: string
	date?: string
	tags: string[]
}

export type IndexFolderEntry = {
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

export type Project = {
	id: string
	title: string
	slug: string
	status: Status
	date: string | null
	description: string | null
	body: string | null
	links: string | null
	keywords: string | null
	has_index: 0 | 1
	deleted_at: string | null
	delete_after: string | null
	created_at: string
	updated_at: string
	tags: Tag[]
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

export type SelectedFile = {
	path: string
	meta: IndexFileEntry
	content: string | null
}
