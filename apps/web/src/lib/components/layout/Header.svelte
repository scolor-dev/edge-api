<script lang="ts">
	import { page } from '$app/state'
	import { NAV_LINKS } from '$lib/constants/nav'
	import { SOCIAL_LINKS } from '$lib/constants/links'
	import { siGithub, siX } from 'simple-icons'

	let scrolled = $state(false)
	let menuOpen = $state(false)

	$effect(() => {
		const onScroll = () => { scrolled = window.scrollY > 10 }
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	})

	function toggleMenu() { menuOpen = !menuOpen }
	function closeMenu() { menuOpen = false }
</script>

<header
	class="fixed top-0 w-full z-50 transition-all duration-300 border-b {menuOpen
		? 'bg-white border-gray-100'
		: scrolled
			? 'bg-white/80 backdrop-blur-md border-gray-100'
			: 'bg-transparent border-transparent'}"
>
	<nav class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-8 max-w-6xl mx-auto">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 group" onclick={closeMenu}>
			<span class="text-sm sm:text-base font-semibold tracking-tight">
				<span class="text-sky-400">scolor</span><span class="text-gray-300">.dev</span>
			</span>
		</a>

		<!-- Desktop nav -->
		<ul class="hidden md:flex items-center gap-6 lg:gap-8">
			{#each NAV_LINKS as link}
				<li>
					<a
						href={link.href}
						class="text-sm transition-colors duration-200 hover:text-gray-900"
						class:text-sky-400={page.url.pathname === link.href}
						class:font-medium={page.url.pathname === link.href}
						class:text-gray-500={page.url.pathname !== link.href}
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Desktop social links -->
		<div class="hidden md:flex items-center gap-3">
			<a
				href={SOCIAL_LINKS.github}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				class="text-gray-400 hover:text-gray-900 p-1 transition-colors duration-200"
			>
				<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d={siGithub.path} />
				</svg>
			</a>
			<a
				href={SOCIAL_LINKS.x}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="X (Twitter)"
				class="text-gray-400 hover:text-gray-900 p-1 transition-colors duration-200"
			>
				<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d={siX.path} />
				</svg>
			</a>
		</div>

		<!-- Mobile hamburger -->
		<button
			class="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5"
			onclick={toggleMenu}
			aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
			aria-expanded={menuOpen}
		>
			<span
				class="block w-5 h-px bg-gray-600 transition-all duration-300 origin-center"
				class:translate-y-[7px]={menuOpen}
				class:rotate-45={menuOpen}
			></span>
			<span
				class="block w-5 h-px bg-gray-600 transition-all duration-300"
				class:opacity-0={menuOpen}
				class:scale-x-0={menuOpen}
			></span>
			<span
				class="block w-5 h-px bg-gray-600 transition-all duration-300 origin-center"
				class:-translate-y-[7px]={menuOpen}
				class:-rotate-45={menuOpen}
			></span>
		</button>
	</nav>

	<!-- Mobile drawer -->
	<div
		class="md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white"
		style:max-height={menuOpen ? '24rem' : '0'}
		style:opacity={menuOpen ? '1' : '0'}
	>
		<div class="px-4 pb-6 sm:px-6 flex flex-col gap-4 border-t border-gray-100">
			<ul class="flex flex-col pt-1">
				{#each NAV_LINKS as link}
					<li>
						<a
							href={link.href}
							class="flex items-center py-3 text-sm border-b border-gray-50 transition-colors"
							class:text-sky-400={page.url.pathname === link.href}
							class:font-medium={page.url.pathname === link.href}
							class:text-gray-700={page.url.pathname !== link.href}
							onclick={closeMenu}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="flex items-center gap-5 pt-1">
				<a
					href={SOCIAL_LINKS.github}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					class="text-gray-400 hover:text-gray-900 transition-colors"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={siGithub.path} />
					</svg>
				</a>
				<a
					href={SOCIAL_LINKS.x}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="X (Twitter)"
					class="text-gray-400 hover:text-gray-900 transition-colors"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={siX.path} />
					</svg>
				</a>
			</div>
		</div>
	</div>
</header>
