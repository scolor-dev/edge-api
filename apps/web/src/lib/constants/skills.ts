import {
	siTypescript, siJavascript, siPython, siGo, siRust,
	siSvelte, siHono, siReact, siVuedotjs, siNodedotjs,
	siCloudflare, siDocker, siPostgresql, siSqlite, siGit,
} from 'simple-icons'

export type Skill = {
	name: string
	path: string
	hex: string
}

export type SkillCategory = {
	title: string
	items: Skill[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
	{
		title: 'Language',
		items: [
			{ name: 'TypeScript', path: siTypescript.path, hex: siTypescript.hex },
			{ name: 'JavaScript', path: siJavascript.path, hex: siJavascript.hex },
			{ name: 'Python',     path: siPython.path,     hex: siPython.hex },
			{ name: 'Go',         path: siGo.path,         hex: siGo.hex },
			{ name: 'Rust',       path: siRust.path,       hex: '#6B7280' },
		],
	},
	{
		title: 'Framework / Library',
		items: [
			{ name: 'SvelteKit', path: siSvelte.path,    hex: siSvelte.hex },
			{ name: 'Hono',      path: siHono.path,      hex: siHono.hex },
			{ name: 'React',     path: siReact.path,     hex: siReact.hex },
			{ name: 'Vue.js',    path: siVuedotjs.path,  hex: siVuedotjs.hex },
			{ name: 'Node.js',   path: siNodedotjs.path, hex: siNodedotjs.hex },
		],
	},
	{
		title: 'Infrastructure',
		items: [
			{ name: 'Cloudflare', path: siCloudflare.path, hex: siCloudflare.hex },
			{ name: 'Docker',     path: siDocker.path,     hex: siDocker.hex },
			{ name: 'PostgreSQL', path: siPostgresql.path, hex: siPostgresql.hex },
			{ name: 'SQLite',     path: siSqlite.path,     hex: siSqlite.hex },
			{ name: 'Git',        path: siGit.path,        hex: siGit.hex },
		],
	},
]
