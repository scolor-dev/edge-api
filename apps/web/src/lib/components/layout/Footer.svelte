<script lang="ts">
	import { NAV_LINKS } from '$lib/constants/nav'
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'

	const currentYear = new Date().getFullYear()
</script>

<footer class="w-full border-t border-gray-100 bg-white mt-auto">
	<div class="max-w-5xl mx-auto px-4 py-10 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
		<!-- Brand -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-semibold">
				<span class="text-sky-400">scolor</span><span class="text-gray-400">.dev</span>
			</span>
			<span class="text-xs text-gray-300">© {currentYear}</span>
		</div>

		<!-- Nav links -->
		<ul class="flex flex-wrap gap-x-6 gap-y-2">
			{#each NAV_LINKS as link}
				<li>
					<a href={link.href} class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">
						{link.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Social links -->
		<div class="flex items-center gap-4">
			<a
				href={SOCIAL_LINKS.github}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
			>
				<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d={siGithub.path} />
				</svg>
			</a>
			<a
				href={SOCIAL_LINKS.x}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="X"
				class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
			>
				<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d={siX.path} />
				</svg>
			</a>
		</div>
	</div>
</footer>
