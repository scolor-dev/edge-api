<script lang="ts">
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'

	let imgError = $state(false)
</script>

<section class="relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-[640px] flex items-center overflow-hidden">
	<!-- Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-white via-sky-50/50 to-white">
		<!-- Dot grid -->
		<div
			class="absolute inset-0 opacity-40"
			style="background-image: radial-gradient(circle, #bae6fd 1px, transparent 1px); background-size: 28px 28px;"
		></div>
		<!-- Blur orbs -->
		<div class="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-12 -left-20 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl"></div>
		<div class="absolute top-1/2 left-1/3 w-48 h-48 bg-sky-50/60 rounded-full blur-2xl"></div>
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

			<!-- Profile image with rotating ring -->
			<div class="flex-shrink-0 flex items-center justify-center">
				<div class="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60">
					<!-- Rotating outer ring with dot -->
					<div class="absolute inset-0 rounded-full border-2 border-sky-200 animate-[spin_20s_linear_infinite]">
						<div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sky-300 shadow-sm shadow-sky-200"></div>
					</div>
					<!-- Slower counter-rotating inner ring -->
					<div class="absolute inset-3 rounded-full border border-dashed border-sky-100 animate-[spin_35s_linear_infinite_reverse]">
						<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-200"></div>
					</div>
					<!-- Profile image -->
					<div class="absolute inset-5 rounded-full overflow-hidden shadow-md ring-4 ring-white">
						{#if !imgError}
							<img
								src="/avatar.svg"
								alt="scolor"
								class="w-full h-full object-cover"
								onerror={() => (imgError = true)}
							/>
						{:else}
							<div class="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
								<span class="text-4xl sm:text-5xl font-bold text-sky-400 select-none">S</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

		</div>
	</div>
</section>
