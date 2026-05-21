<script lang="ts">
	type SiblingRow = { key: string; label: string; description: string }

	let { value = "" }: { value?: string } = $props()

	function parseSiblings(raw: string): SiblingRow[] {
		try {
			if (!raw) return []
			const parsed = JSON.parse(raw) as Record<string, { label: string; description?: string }>
			return Object.entries(parsed).map(([key, v]) => ({
				key,
				label: v.label,
				description: v.description ?? "",
			}))
		} catch {
			return []
		}
	}

	let siblings = $state<SiblingRow[]>(parseSiblings(value))

	const siblingsJson = $derived(
		JSON.stringify(
			Object.fromEntries(
				siblings
					.filter((s) => s.key.trim())
					.map((s) => [
						s.key.trim(),
						{
							label: s.label,
							...(s.description.trim() ? { description: s.description.trim() } : {}),
						},
					]),
			),
		),
	)

	function add() {
		siblings.push({ key: "", label: "", description: "" })
	}

	function remove(i: number) {
		siblings.splice(i, 1)
	}
</script>

<input type="hidden" name="siblings" value={siblingsJson} />

<div class="space-y-2">
	{#each siblings as _, i}
		<div class="space-y-1">
			<div class="flex gap-2">
				<input
					bind:value={siblings[i].key}
					placeholder="project-slug"
					class="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
				/>
				<input
					bind:value={siblings[i].label}
					placeholder="Label"
					class="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
				/>
				<button
					type="button"
					onclick={() => remove(i)}
					aria-label="Remove sibling"
					class="text-gray-300 hover:text-red-400"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<input
				bind:value={siblings[i].description}
				placeholder="Description (optional)"
				class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-400"
			/>
		</div>
	{/each}
	<button type="button" onclick={add} class="text-xs text-gray-400 hover:text-gray-700">
		+ Add sibling
	</button>
</div>
