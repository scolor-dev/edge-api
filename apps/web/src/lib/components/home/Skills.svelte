<script lang="ts">
	import { SKILL_CATEGORIES } from '$lib/constants/skills'
</script>

<section class="w-full py-16 sm:py-20 md:py-24 bg-gray-50/60">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
		<!-- Heading -->
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1 h-6 rounded-full bg-sky-400"></div>
			<h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Skills</h2>
		</div>
		<p class="text-gray-400 text-sm mb-12 pl-4">言語・フレームワーク・インフラ</p>

		<div class="flex flex-col gap-12">
			{#each SKILL_CATEGORIES as category}
				<div>
					<h3 class="text-xs uppercase tracking-widest text-gray-400 font-medium mb-6">
						{category.title}
					</h3>
					<div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-x-4 gap-y-6">
						{#each category.items as skill}
							<div class="group flex flex-col items-center gap-2 cursor-default">
								<div class="w-10 h-10 relative">
									<!-- Gray (default) -->
									<svg
										class="absolute inset-0 w-10 h-10 text-gray-300 transition-all duration-200 group-hover:opacity-0 group-hover:scale-90"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d={skill.path} />
									</svg>
									<!-- Brand color (hover) -->
									<svg
										class="absolute inset-0 w-10 h-10 opacity-0 scale-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100"
										viewBox="0 0 24 24"
										fill="currentColor"
										style="color: #{skill.hex}"
										aria-hidden="true"
									>
										<path d={skill.path} />
									</svg>
								</div>
								<p class="text-[11px] text-gray-400 text-center leading-tight">{skill.name}</p>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-12 pt-8 border-t border-gray-200">
			<a
				href="/skills"
				class="text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors duration-200"
			>
				スキル詳細を見る →
			</a>
		</div>
	</div>
</section>
