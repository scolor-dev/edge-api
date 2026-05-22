<script lang="ts">
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'

	let imgError = $state(false)
</script>

<section class="relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-[640px] flex items-center overflow-hidden">
	<!-- Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-white to-sky-50">
		<!-- Dot grid -->
		<div
			class="absolute inset-0 opacity-40"
			style="background-image: radial-gradient(circle, #bae6fd 1px, transparent 1px); background-size: 28px 28px;"
		></div>
		<!-- Blur orbs -->
		<div class="absolute -top-20 -right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 -left-12 w-56 h-56 bg-sky-100/40 rounded-full blur-3xl"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
		<div class="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">

			<!-- Text -->
			<div class="flex-1 flex flex-col gap-5 text-center md:text-left">
				<div class="flex flex-col gap-2">
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
						scolor
					</h1>
					<p class="text-lg sm:text-xl text-sky-500 font-medium">
						フルスタックエンジニア
					</p>
				</div>

				<p class="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0">
					Web の設計から実装まで、丁寧につくります。
				</p>

				<!-- CTA buttons -->
				<div class="flex flex-wrap gap-3 justify-center md:justify-start">
					<a
						href="/projects"
						class="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
					>
						作品を見る
					</a>
					<a
						href="/profile"
						class="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
					>
						自己紹介
					</a>
				</div>

				<!-- Social links -->
				<div class="flex items-center gap-4 justify-center md:justify-start">
					<a
						href={SOCIAL_LINKS.github}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub"
						class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d={siX.path} />
						</svg>
					</a>
				</div>
			</div>

			<!-- Profile image -->
			<div class="flex-shrink-0">
				<div class="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full overflow-hidden shadow-md ring-4 ring-white">
					{#if !imgError}
						<img
							src="/avatar.svg"
							alt="scolor"
							class="w-full h-full object-cover"
							onerror={() => (imgError = true)}
						/>
					{:else}
						<div class="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
							<span class="text-5xl sm:text-6xl md:text-7xl font-bold text-sky-400 select-none">S</span>
						</div>
					{/if}
				</div>
			</div>

		</div>
	</div>
</section>
