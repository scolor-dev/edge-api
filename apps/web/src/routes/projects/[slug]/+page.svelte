<script lang="ts">
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	// SSR
	function formatDate(d: string) {
		const dt = new Date(d)
		return `${dt.getFullYear()}年${String(dt.getMonth() + 1).padStart(2, '0')}月`
	}

	function parseLinks(raw: string | null): { label: string; url: string }[] {
		if (!raw) return []
		try { return JSON.parse(raw) } catch { return [] }
	}

	// CSR
	type TocItem = { id: string; text: string; level: number }

	let renderedHtml = $state('')
	let toc = $state<TocItem[]>([])
	let activeId = $state('')
	let contentEl = $state<HTMLElement | null>(null)

	function slugify(text: string) {
		return text
			.toLowerCase()
			.replace(/[^\w\s぀-鿿-]/g, '')
			.trim()
			.replace(/\s+/g, '-')
	}

	onMount(async () => {
		if (!data.readme) return

		const { marked, Renderer } = await import('marked')

		// Extract TOC from raw markdown before rendering
		const headingRegex = /^(#{1,3})\s+(.+)$/gm
		const items: TocItem[] = []
		let m: RegExpExecArray | null
		while ((m = headingRegex.exec(data.readme)) !== null) {
			const level = m[1].length
			const text = m[2].trim()
			items.push({ id: slugify(text), text, level })
		}
		toc = items

		// Custom renderer to add IDs to headings
		const renderer = new Renderer()
		renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
			const id = slugify(text)
			return `<h${depth} id="${id}">${text}</h${depth}>\n`
		}

		renderedHtml = await marked(data.readme, { renderer, async: true })

		// Intersection observer for active TOC item
		if (items.length === 0) return
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id
					}
				}
			},
			{ rootMargin: '-80px 0px -60% 0px', threshold: 0 },
		)

		// Wait for DOM update
		setTimeout(() => {
			items.forEach(({ id }) => {
				const el = document.getElementById(id)
				if (el) observer.observe(el)
			})
		}, 50)

		return () => observer.disconnect()
	})
</script>

<svelte:head>
	<title>{data.title} | scolor.dev</title>
	{#if data.description}
		<meta name="description" content={data.description} />
	{/if}
</svelte:head>

<div class="w-full min-h-screen">
	<!-- Hero header (SSR) -->
	<div class="w-full border-b border-gray-100 bg-white">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
			<!-- Breadcrumb -->
			<div class="flex items-center gap-2 text-xs text-gray-400 mb-6">
				<a href="/projects" class="hover:text-sky-500 transition-colors duration-150">Projects</a>
				<span>/</span>
				<span class="text-gray-600">{data.title}</span>
			</div>

			<!-- Title -->
			<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
				{data.title}
			</h1>

			<!-- Meta row -->
			<div class="flex flex-wrap items-center gap-3 mb-5">
				<span class="text-sm text-gray-400 tabular-nums">{formatDate(data.date)}</span>
				{#if data.tags.length > 0}
					<span class="text-gray-200">|</span>
					<div class="flex flex-wrap gap-1.5">
						{#each data.tags as tag}
							<a
								href="/projects?tag={tag.slug}"
								class="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-500 text-xs font-medium hover:bg-sky-100 transition-colors duration-150"
							>
								{tag.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Description -->
			{#if data.description}
				<p class="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
					{data.description}
				</p>
			{/if}

			<!-- Links -->
			{@const links = parseLinks(data.links)}
			{#if links.length > 0}
				<div class="flex flex-wrap gap-3">
					{#each links as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-sky-200 hover:text-sky-500 transition-colors duration-150"
						>
							{link.label}
							<svg class="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Body (CSR) -->
	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10">
		{#if !data.readme}
			<p class="text-gray-400 text-sm">コンテンツがありません。</p>
		{:else if !renderedHtml}
			<!-- Loading skeleton -->
			<div class="flex gap-10">
				<div class="flex-1 flex flex-col gap-3">
					{#each [80, 100, 60, 90, 70] as w}
						<div class="h-4 rounded bg-gray-100 animate-pulse" style="width: {w}%"></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="flex flex-col lg:flex-row gap-10">
				<!-- Markdown content -->
				<article
					bind:this={contentEl}
					class="flex-1 min-w-0 prose prose-gray prose-sm sm:prose-base max-w-none
						prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:scroll-mt-24
						prose-a:text-sky-500 prose-a:no-underline hover:prose-a:underline
						prose-code:text-sky-600 prose-code:bg-sky-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
						prose-pre:bg-gray-900 prose-pre:text-gray-100
						prose-blockquote:border-sky-300 prose-blockquote:text-gray-500
						prose-hr:border-gray-100"
				>
					{@html renderedHtml}
				</article>

				<!-- TOC sidebar -->
				{#if toc.length > 0}
					<aside class="lg:w-56 xl:w-64 flex-shrink-0">
						<div class="sticky top-24">
							<p class="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-3">目次</p>
							<nav class="flex flex-col gap-0.5">
								{#each toc as item}
									<a
										href="#{item.id}"
										class="text-xs leading-relaxed py-0.5 transition-colors duration-150 truncate
											{item.level === 1 ? 'pl-0 font-medium' : item.level === 2 ? 'pl-3' : 'pl-6'}
											{activeId === item.id ? 'text-sky-500' : 'text-gray-400 hover:text-gray-700'}"
									>
										{item.text}
									</a>
								{/each}
							</nav>
						</div>
					</aside>
				{/if}
			</div>
		{/if}
	</div>
</div>
