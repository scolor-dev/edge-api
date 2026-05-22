<script lang="ts">
	import { SKILL_CATEGORIES } from '$lib/constants/skills'

	const proficiencies: Record<string, { level: number; note: string }> = {
		TypeScript: { level: 4, note: '型安全な設計・複雑な型演算' },
		JavaScript: { level: 4, note: 'DOM 操作・非同期処理' },
		Python:     { level: 3, note: 'スクリプト・ML 周辺' },
		Go:         { level: 2, note: '基本的な CLI / API 開発' },
		Rust:       { level: 2, note: 'WASM ビルド・学習中' },
		SvelteKit:  { level: 4, note: 'フルスタック開発・SSR / CSR' },
		Hono:       { level: 4, note: 'Cloudflare Workers 上の API' },
		React:      { level: 3, note: 'hooks / 状態管理' },
		'Vue.js':   { level: 2, note: '基本的なコンポーネント設計' },
		'Node.js':  { level: 3, note: 'サーバー・ツール作成' },
		Cloudflare: { level: 4, note: 'Workers / D1 / R2 / Pages' },
		Docker:     { level: 3, note: 'compose・開発環境構築' },
		PostgreSQL: { level: 3, note: 'スキーマ設計・インデックス' },
		SQLite:     { level: 3, note: 'D1 / 組み込み DB' },
		Git:        { level: 4, note: 'ブランチ運用・PR ベース開発' },
	}

	const levelLabel = ['', '学習中', '基礎', '実務レベル', '得意', '自信あり']
</script>

<svelte:head>
	<title>Skills | scolor.dev</title>
	<meta name="description" content="scolor のスキル一覧" />
</svelte:head>

<div class="w-full min-h-screen">
	<!-- Header -->
	<div class="w-full border-b border-gray-100 bg-white">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-16">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-1 h-6 rounded-full bg-sky-400"></div>
				<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Skills</h1>
			</div>
			<p class="text-gray-400 text-sm pl-4">言語・フレームワーク・インフラ</p>
		</div>
	</div>

	<!-- Content -->
	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-14 flex flex-col gap-14">
		{#each SKILL_CATEGORIES as category}
			<section>
				<h2 class="text-xs uppercase tracking-widest text-gray-400 font-medium mb-6">
					{category.title}
				</h2>
				<div class="flex flex-col gap-3">
					{#each category.items as skill}
						{@const p = proficiencies[skill.name]}
						<div class="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-sky-100 transition-colors duration-150 group">
							<!-- Icon -->
							<div class="w-9 h-9 flex-shrink-0 relative">
								<svg
									class="absolute inset-0 w-9 h-9 text-gray-300 transition-all duration-200 group-hover:opacity-0 group-hover:scale-90"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d={skill.path} />
								</svg>
								<svg
									class="absolute inset-0 w-9 h-9 opacity-0 scale-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100"
									viewBox="0 0 24 24"
									fill="currentColor"
									style="color: #{skill.hex}"
									aria-hidden="true"
								>
									<path d={skill.path} />
								</svg>
							</div>

							<!-- Name + note -->
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-gray-800">{skill.name}</p>
								{#if p?.note}
									<p class="text-[11px] text-gray-400 mt-0.5">{p.note}</p>
								{/if}
							</div>

							<!-- Level bar -->
							{#if p}
								<div class="flex-shrink-0 flex flex-col items-end gap-1">
									<span class="text-[10px] text-gray-400">{levelLabel[p.level]}</span>
									<div class="flex gap-1">
										{#each { length: 5 } as _, i}
											<div
												class="w-5 h-1.5 rounded-full transition-colors duration-150
													{i < p.level ? 'bg-sky-400' : 'bg-gray-100'}"
											></div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
