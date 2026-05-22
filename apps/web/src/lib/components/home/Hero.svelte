<script lang="ts">
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'
</script>

<section class="relative w-full min-h-[560px] sm:min-h-[620px] md:min-h-[660px] flex items-center overflow-hidden">
	<!-- Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-white via-sky-50/40 to-white">
		<!-- Dot grid -->
		<div
			class="absolute inset-0 opacity-[0.35]"
			style="background-image: radial-gradient(circle, #bae6fd 1px, transparent 1px); background-size: 28px 28px;"
		></div>
		<!-- Blur orbs -->
		<div class="absolute -top-24 -right-24 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 -left-16 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
		<div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
			<!-- Text content -->
			<div class="flex-1 flex flex-col gap-5 text-center md:text-left">
				<!-- Badge -->
				<span class="inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-sky-500 font-medium">
					<span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
					Portfolio
				</span>

				<div class="flex flex-col gap-2">
					<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
						scolor
					</h1>
					<p class="text-lg sm:text-xl text-sky-500 font-medium">
						Full-Stack Engineer
					</p>
				</div>

				<p class="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0">
					Web の設計から実装まで、丁寧につくります。
				</p>

				<!-- CTA buttons -->
				<div class="flex flex-wrap gap-3 justify-center md:justify-start mt-1">
					<a
						href="/projects"
						class="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
					>
						Projects
					</a>
					<a
						href="/profile"
						class="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
					>
						Profile
					</a>
				</div>

				<!-- Social links -->
				<div class="flex items-center gap-4 justify-center md:justify-start mt-1">
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

			<!-- Avatar / decoration -->
			<div class="flex-shrink-0 flex items-center justify-center order-first md:order-last">
				<div class="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60">
					<!-- Outer ring -->
					<div class="absolute inset-0 rounded-full border-2 border-sky-100 animate-[spin_30s_linear_infinite]">
						<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-300"></div>
					</div>
					<!-- Inner circle -->
					<div class="absolute inset-4 rounded-full bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center shadow-sm border border-sky-100/80">
						<span class="text-4xl sm:text-5xl md:text-6xl font-bold text-sky-300 select-none">S</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
