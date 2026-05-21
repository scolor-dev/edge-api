<script lang="ts">
	let { value = "" }: { value?: string } = $props()

	function parseLinks(raw: string): { key: string; url: string }[] {
		try {
			if (!raw) return []
			const parsed = JSON.parse(raw) as Record<string, string>
			return Object.entries(parsed).map(([key, url]) => ({ key, url }))
		} catch {
			return []
		}
	}

	let links = $state<{ key: string; url: string }[]>(parseLinks(value))

	const linksJson = $derived(
		JSON.stringify(
			Object.fromEntries(
				links.filter((l) => l.key.trim()).map((l) => [l.key.trim(), l.url]),
			),
		),
	)

	function add() {
		links.push({ key: "", url: "" })
	}

	function remove(i: number) {
		links.splice(i, 1)
	}
</script>

<input type="hidden" name="links" value={linksJson} />

<div class="space-y-2">
	{#each links as link, i}
		<div class="flex gap-2">
			<input
				bind:value={links[i].key}
				placeholder="github"
				class="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
			/>
			<input
				bind:value={links[i].url}
				placeholder="https://..."
				type="url"
				class="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
			/>
			<button
				type="button"
				onclick={() => remove(i)}
				aria-label="Remove link"
				class="text-gray-300 hover:text-red-400"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/each}

	<button
		type="button"
		onclick={add}
		class="text-xs text-gray-400 hover:text-gray-700"
	>
		+ Add link
	</button>
</div>
