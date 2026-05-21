<script lang="ts">
	const stats = [
		{ label: "Projects", value: "—" },
		{ label: "Blog Posts", value: "—" },
		{ label: "Tags", value: "—" },
		{ label: "Drafts", value: "—" },
	]
</script>

<div class="space-y-8">
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each stats as stat}
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<p class="text-sm text-gray-500">{stat.label}</p>
				<p class="mt-2 text-3xl font-bold text-gray-800">{stat.value}</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<div class="rounded-xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-sm font-semibold text-gray-700">Recent Projects</h2>
			<p class="text-sm text-gray-400">No data yet.</p>
		</div>
		<div class="rounded-xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-sm font-semibold text-gray-700">Recent Posts</h2>
			<p class="text-sm text-gray-400">No data yet.</p>
		</div>
	</div>
</div>
