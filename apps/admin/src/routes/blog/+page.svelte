<script lang="ts">
	import { enhance } from "$app/forms"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()

	const statuses = ["all", "published", "draft", "private", "archived"] as const
	type StatusFilter = (typeof statuses)[number]

	let filter = $state<StatusFilter>("all")

	const filtered = $derived(
		filter === "all" ? data.posts : data.posts.filter((p) => p.status === filter),
	)

	const statusColor: Record<string, string> = {
		published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600",
		private: "bg-yellow-100 text-yellow-700",
		archived: "bg-red-100 text-red-600",
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex gap-2">
			{#each statuses as s}
				<button
					type="button"
					onclick={() => (filter = s)}
					class="rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors {filter === s
						? 'bg-gray-900 text-white'
						: 'bg-white text-gray-500 hover:bg-gray-100'}"
				>
					{s}
				</button>
			{/each}
		</div>
		<a
			href="/blog/new"
			class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700"
		>
			New Post
		</a>
	</div>

	<div class="overflow-hidden rounded-xl bg-white shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-gray-100 text-left text-xs text-gray-400">
					<th class="px-6 py-3 font-medium">Title</th>
					<th class="px-4 py-3 font-medium">Status</th>
					<th class="px-4 py-3 font-medium">Date</th>
					<th class="px-4 py-3 font-medium">Tags</th>
					<th class="px-4 py-3 font-medium"></th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as post}
					<tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
						<td class="px-6 py-3">
							<p class="font-medium text-gray-800">{post.title}</p>
							<p class="font-mono text-xs text-gray-400">{post.slug}</p>
						</td>
						<td class="px-4 py-3">
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {statusColor[post.status] ??
									'bg-gray-100 text-gray-600'}"
							>
								{post.status}
							</span>
						</td>
						<td class="px-4 py-3 text-xs text-gray-500">
							{post.date ? post.date.slice(0, 10) : "—"}
						</td>
						<td class="px-4 py-3 text-xs text-gray-500">
							{post.tags.length > 0 ? post.tags.map((t) => t.name).join(", ") : "—"}
						</td>
						<td class="px-4 py-3">
							<div class="flex items-center justify-end gap-3">
								<a href="/blog/{post.slug}" class="text-xs text-gray-400 hover:text-gray-700">
									Edit
								</a>
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === "redirect") {
												window.location.href = result.location
											} else {
												await update({ reset: false })
											}
										}
									}}
								>
									<input type="hidden" name="slug" value={post.slug} />
									<button type="submit" class="text-xs text-gray-400 hover:text-red-500">
										Delete
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
				{#if filtered.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-8 text-center text-sm text-gray-400">No posts.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
