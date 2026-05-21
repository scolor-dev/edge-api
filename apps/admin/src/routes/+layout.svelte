<script lang="ts">
	import "./layout.css"
	import { page } from "$app/state"

	let { children } = $props()

	const navItems = [
		{
			href: "/",
			label: "Dashboard",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
		},
		{
			href: "/projects",
			label: "Projects",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 12h18M3 17h18" />`,
		},
		{
			href: "/blog",
			label: "Blog",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />`,
		},
		{
			href: "/tags",
			label: "Tags",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 10V5a2 2 0 012-2z" />`,
		},
	] as const

	const pageTitle = $derived(
		navItems.find((item) => item.href === page.url.pathname)?.label ?? "Admin",
	)
</script>

<div class="flex h-screen bg-gray-100">
	<aside class="flex w-64 flex-col bg-gray-900 text-white">
		<div class="border-b border-gray-700 px-6 py-5">
			<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Portfolio</span>
			<p class="mt-1 text-base font-bold">Admin</p>
		</div>

		<nav class="flex-1 p-4">
			<ul class="space-y-1">
				{#each navItems as item}
					{@const active = page.url.pathname === item.href}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {active
								? 'bg-gray-700 text-white'
								: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
						>
							<svg
								class="h-5 w-5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 24 24"
							>
								{@html item.icon}
							</svg>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<div class="flex flex-1 flex-col overflow-hidden">
		<header class="border-b border-gray-200 bg-white px-8 py-4">
			<h1 class="text-xl font-semibold text-gray-800">{pageTitle}</h1>
		</header>

		<main class="flex-1 overflow-auto p-8">
			{@render children()}
		</main>
	</div>
</div>
