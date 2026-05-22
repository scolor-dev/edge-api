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
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each data.projects as project}
					{@const links = parseLinks(project.links)}
					<a
						href="/projects/{project.slug}"
						class="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-200 hover:border-sky-200 hover:shadow-sm hover:shadow-sky-100/50 transition-all duration-200 bg-white"
					>
						<!-- Title + date -->
						<div class="flex flex-col gap-1">
							<h2 class="text-base font-semibold text-gray-900 group-hover:text-sky-500 transition-colors duration-150 leading-snug">
								{project.title}
							</h2>
							<p class="text-xs text-gray-400">{formatDate(project.date)}</p>
						</div>

						<!-- Description -->
						{#if project.description}
							<p class="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
								{project.description}
							</p>
						{:else}
							<div class="flex-1"></div>
						{/if}

						<!-- Tags -->
						{#if project.tags.length > 0}
							<div class="flex flex-wrap gap-1.5 mt-auto">
								{#each project.tags as tag}
									<span class="px-2 py-0.5 rounded-full bg-sky-50 text-sky-500 text-[11px] font-medium">
										{tag.name}
									</span>
								{/each}
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
