<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	function formatDate(d: string) {
		const dt = new Date(d)
		return `${dt.getFullYear()}年${String(dt.getMonth() + 1).padStart(2, '0')}月`
	}

	function parseLinks(raw: string | null): { label: string; url: string }[] {
		if (!raw) return []
		try {
			return JSON.parse(raw)
		} catch {
			return []
		}
	}
</script>

<svelte:head>
	<title>Projects | scolor.dev</title>
	<meta name="description" content="scolor の制作物一覧" />
</svelte:head>

<section class="w-full min-h-screen py-20 sm:py-24">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
		<!-- Heading -->
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1 h-6 rounded-full bg-sky-400"></div>
			<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
		</div>
		<p class="text-gray-400 text-sm mb-10 pl-4">制作物・個人開発</p>

		<!-- Tag filter -->
		{#if data.tags.length > 0}
			<div class="flex flex-wrap gap-2 mb-10">
				<a
					href="/projects"
					class="px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-150
						{!data.selectedTag
						? 'bg-gray-900 text-white border-gray-900'
						: 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					すべて
				</a>
				{#each data.tags as tag}
					<a
						href="/projects?tag={tag.slug}"
						class="px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-150
							{data.selectedTag === tag.slug
							? 'bg-gray-900 text-white border-gray-900'
							: 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						{tag.name}
					</a>
				{/each}
			</div>
		{/if}

		<!-- Project grid -->
		{#if data.projects.length === 0}
			<p class="text-gray-400 text-sm">プロジェクトがありません。</p>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.projects as project}
					<a
						href="/projects/{project.slug}"
						class="group relative flex flex-col gap-4 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
					>
						<!-- Top accent line -->
						<div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-300 via-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

						<!-- Header -->
						<div class="flex items-start justify-between gap-2">
							<div class="flex flex-col gap-0.5 min-w-0">
								<h2 class="text-sm font-semibold text-gray-900 group-hover:text-sky-500 transition-colors duration-150 leading-snug truncate">
									{project.title}
								</h2>
								<p class="text-[11px] text-gray-400 tabular-nums">{formatDate(project.date)}</p>
							</div>
							{#if project.has_index}
								<span class="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-400 border border-sky-100">
									Docs
								</span>
							{/if}
						</div>

						<!-- Description -->
						{#if project.description}
							<p class="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
								{project.description}
							</p>
						{:else}
							<div class="flex-1"></div>
						{/if}

						<!-- Footer: tags + arrow -->
						<div class="flex items-end justify-between gap-2 mt-auto">
							{#if project.tags.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each project.tags as tag}
										<span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
											{tag.name}
										</span>
									{/each}
								</div>
							{:else}
								<div></div>
							{/if}
							<svg class="w-4 h-4 text-gray-300 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
