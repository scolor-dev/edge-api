export interface IndexFileEntry {
	title: string
	uuid: string
	description?: string
	date?: string
	tags: string[]
}

export interface IndexFolderEntry {
	title: string
	description?: string
	date?: string
	tags: string[]
}

export interface IndexSiblingEntry {
	label: string
	description?: string
}

export interface IndexJson {
	files: Record<string, IndexFileEntry>
	folders: Record<string, IndexFolderEntry>
	siblings: Record<string, IndexSiblingEntry>
}

export const emptyIndexJson = (): IndexJson => ({
	files: {},
	folders: {},
	siblings: {},
})
