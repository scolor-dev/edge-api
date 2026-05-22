<script lang="ts">
	import InfoCard from '$lib/components/ui/InfoCard.svelte'
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'

	const timeline = [
		{ year: '2023', label: '福岡工業大学 情報学部 入学' },
		{ year: '2023', label: '個人開発を始める（Python / Flask）' },
		{ year: '2024', label: 'TypeScript / SvelteKit に移行' },
		{ year: '2024', label: 'Cloudflare Workers でサーバーレス開発を開始' },
		{ year: '2025', label: 'Rust / WebAssembly を学習開始' },
		{ year: '2026', label: 'ポートフォリオサイトを構築' },
	]
</script>

<svelte:head>
	<title>Profile | scolor.dev</title>
	<meta name="description" content="scolor のプロフィール" />
</svelte:head>

<div class="w-full min-h-screen">
	<!-- Hero -->
	<div class="w-full border-b border-gray-100 bg-white">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20">
			<div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
				<!-- Avatar -->
				<div class="flex-shrink-0">
					<div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shadow-sm ring-4 ring-white">
						<span class="text-4xl font-bold text-sky-400 select-none">S</span>
					</div>
				</div>

				<!-- Bio -->
				<div class="flex flex-col gap-3 text-center sm:text-left">
					<div>
						<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">scolor</h1>
						<p class="text-sky-500 font-medium mt-0.5">フルスタックエンジニア</p>
					</div>
					<p class="text-gray-500 text-sm leading-relaxed max-w-lg">
						大学で情報系を学びながら、個人開発を続けています。<br />
						API 設計・DB 設計・セキュリティに興味があり、<br />
						バックエンドからフロントエンドまで幅広く触ります。
					</p>
					<!-- Social -->
					<div class="flex items-center gap-4 justify-center sm:justify-start mt-1">
						<a
							href={SOCIAL_LINKS.github}
							target="_blank"
							rel="noopener noreferrer"
							class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
							aria-label="GitHub"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d={siGithub.path} />
							</svg>
						</a>
						<a
							href={SOCIAL_LINKS.x}
							target="_blank"
							rel="noopener noreferrer"
							class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
							aria-label="X"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d={siX.path} />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-14 flex flex-col gap-16">

		<!-- Info cards -->
		<section>
			<div class="flex items-center gap-3 mb-6">
				<div class="w-1 h-6 rounded-full bg-sky-400"></div>
				<h2 class="text-xl sm:text-2xl font-bold text-gray-900">About</h2>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<InfoCard label="所属" value="福岡工業大学 情報学部" />
				<InfoCard label="興味" value="API 設計・DB 設計・セキュリティ" />
				<InfoCard label="好きな技術" value="Cloudflare Workers / SvelteKit / Hono" />
				<InfoCard label="趣味" value="個人開発・ゲーム" />
			</div>
		</section>

		<!-- Timeline -->
		<section>
			<div class="flex items-center gap-3 mb-8">
				<div class="w-1 h-6 rounded-full bg-sky-400"></div>
				<h2 class="text-xl sm:text-2xl font-bold text-gray-900">Timeline</h2>
			</div>
			<div class="relative pl-6 flex flex-col gap-0">
				<!-- Vertical line -->
				<div class="absolute left-0 top-2 bottom-2 w-px bg-gray-100"></div>
				{#each timeline as item, i}
					<div class="relative flex gap-5 pb-8 last:pb-0">
						<!-- Dot -->
						<div class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-sky-300 bg-white"></div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] tabular-nums text-sky-400 font-medium">{item.year}</span>
							<p class="text-sm text-gray-700">{item.label}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

	</div>
</div>
