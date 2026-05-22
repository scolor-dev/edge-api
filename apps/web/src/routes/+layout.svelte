<script lang="ts">
	import '../app.css'
	import Header from '$lib/components/layout/Header.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'

	const { children } = $props()
</script>

<svelte:head>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<Header />
<main class="min-h-screen pt-[57px] sm:pt-[65px] flex flex-col">
	{@render children()}
</main>
<Footer />
