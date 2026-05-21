<script lang="ts">
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()

	type Status = "published" | "draft" | "private" | "archived"

	let filterStatus = $state<Status | "all">("all")

	const statusLabel: Record<Status, string> = {
		published: "Published",
		draft: "Draft",
		private: "Private",
		archived: "Archived",
	}

	const statusColor: Record<Status, string> = {
		published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-500",
		private: "bg-amber-100 text-amber-700",
		archived: "bg-red-100 text-red-600",
	}

	const filteredProjects = $derived(
		filterStatus === "all"
			? data.projects
			: data.projects.filter((p: { status: Status }) => p.status === filterStatus),
	)
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex gap-1.5">
			{#each (["all", "published", "draft", "private", "archived"] as const) as s}
				<button
					type="button"
					onclick={() => (filterStatus = s)}
					class="rounded-full px-3 py-1 text-xs transition-colors {filterStatus === s
						? 'bg-gray-900 text-white'
						: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
				>
					{s === "all" ? "All" : statusLabel[s]}
				</button>
			{/each}
		</div>
		<a
			href="/projects/new"
			class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
		>
			+ New Project
		</a>
	</div>

	<div class="rounded-xl bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead
					class="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500"
				>
					<tr>
						<th class="px-6 py-3">Title</th>
						<th class="px-6 py-3">Status</th>
						<th class="px-6 py-3">Tags</th>
						<th class="px-6 py-3">Date</th>
						<th class="px-6 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each filteredProjects as project}
						<tr class="group hover:bg-gray-50">
							<td class="px-6 py-3">
								<div class="font-medium text-gray-800">{project.title}</div>
								<div class="font-mono text-xs text-gray-400">{project.slug}</div>
							</td>
							<td class="px-6 py-3">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColor[project.status as Status]}">
									{statusLabel[project.status as Status]}
								</span>
							</td>
							<td class="px-6 py-3">
								<div class="flex flex-wrap gap-1">
									{#each project.tags as tag}
										<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
											{tag.name}
										</span>
									{/each}
								</div>
							</td>
							<td class="px-6 py-3 text-xs text-gray-400">
								{project.date ? project.date.slice(0, 10) : "—"}
							</td>
							<td class="px-6 py-3">
								<div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100">
									<a
										href="/projects/{project.slug}"
										class="text-xs text-gray-500 hover:text-gray-800"
									>
										Edit
									</a>
									<form
										method="POST"
										action="?/delete"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === "success") await invalidateAll()
												else await update({ reset: false })
											}
										}}
									>
										<input type="hidden" name="slug" value={project.slug} />
										<button
											type="submit"
											class="text-xs text-gray-400 hover:text-red-500"
											aria-label="Delete {project.title}"
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="px-6 py-12 text-center text-gray-400" colspan="5">No projects found.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
