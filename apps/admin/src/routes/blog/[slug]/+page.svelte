<script lang="ts">
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import type { ActionData, PageData } from "./$types"

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const tagSet = $derived(new Set(data.post.tags.map((t: { id: string }) => t.id)))

	const groupedTags = $derived(() => {
		const map = new Map<string, { label: string; tags: typeof data.tags }>()
		for (const cat of data.tags
			.map((t) => ({ id: t.category_id ?? "", name: t.category_name ?? "Uncategorized" }))
			.filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)) {
			if (!map.has(cat.id)) map.set(cat.id, { label: cat.name, tags: [] })
		}
		map.set("", { label: "Uncategorized", tags: [] })
		for (const tag of data.tags) {
			const key = tag.category_id ?? ""
			map.get(key)?.tags.push(tag)
		}
		return [...map.values()].filter((g) => g.tags.length > 0)
	})
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a href="/blog" class="text-sm text-gray-400 hover:text-gray-700">← Blog</a>
			<h1 class="text-lg font-semibold text-gray-800">{data.post.title}</h1>
		</div>
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
			<button type="submit" class="text-sm text-gray-400 hover:text-red-500">
				Delete
			</button>
		</form>
	</div>

	{#if form?.message}
		<p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{form.message}</p>
	{/if}

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === "success") await invalidateAll()
				else if (result.type === "redirect") window.location.href = result.location
				else await update({ reset: false })
			}
		}}
		class="grid grid-cols-3 gap-6"
	>
		<!-- Main -->
		<div class="col-span-2 space-y-5">
			<div class="rounded-xl bg-white p-6 shadow-sm space-y-4">
				<div class="space-y-1">
					<label for="title" class="text-xs font-medium text-gray-500">Title *</label>
					<input
						id="title"
						name="title"
						value={data.post.title}
						required
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
					/>
				</div>
				<div class="space-y-1">
					<label for="slug" class="text-xs font-medium text-gray-500">Slug *</label>
					<input
						id="slug"
						name="slug"
						value={data.post.slug}
						required
						class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-gray-400"
					/>
				</div>
				<div class="space-y-1">
					<label for="description" class="text-xs font-medium text-gray-500">Description</label>
					<textarea
						id="description"
						name="description"
						rows="2"
						value={data.post.description ?? ""}
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
					></textarea>
				</div>
			</div>

			<div class="rounded-xl bg-white p-6 shadow-sm space-y-2">
				<label for="content" class="text-xs font-medium text-gray-500">Content (Markdown)</label>
				<textarea
					id="content"
					name="content"
					rows="20"
					value={data.post.readme ?? ""}
					class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-gray-400 resize-y"
				></textarea>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="col-span-1 space-y-4">
			<div class="rounded-xl bg-white p-6 shadow-sm space-y-4">
				<div class="space-y-1">
					<label for="status" class="text-xs font-medium text-gray-500">Status</label>
					<select
						id="status"
						name="status"
						value={data.post.status}
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
						<option value="private">Private</option>
						<option value="archived">Archived</option>
					</select>
				</div>
				<div class="space-y-1">
					<label for="date" class="text-xs font-medium text-gray-500">Date</label>
					<input
						id="date"
						name="date"
						type="date"
						value={data.post.date ? data.post.date.slice(0, 10) : ""}
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
					/>
				</div>
				<div class="space-y-1">
					<label for="thumbnail" class="text-xs font-medium text-gray-500">Thumbnail URL</label>
					<input
						id="thumbnail"
						name="thumbnail"
						type="url"
						value={data.post.thumbnail ?? ""}
						placeholder="https://..."
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
					/>
				</div>
				<div class="space-y-1">
					<label for="keywords" class="text-xs font-medium text-gray-500">Keywords</label>
					<input
						id="keywords"
						name="keywords"
						value={data.post.keywords ?? ""}
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
					/>
				</div>
				<div class="space-y-1">
					<label for="body" class="text-xs font-medium text-gray-500">Body (short)</label>
					<textarea
						id="body"
						name="body"
						rows="3"
						value={data.post.body ?? ""}
						class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
					></textarea>
				</div>
			</div>

			<!-- Tags -->
			<div class="rounded-xl bg-white p-6 shadow-sm space-y-3">
				<p class="text-xs font-medium text-gray-500">Tags</p>
				{#each groupedTags() as group}
					<div class="space-y-1.5">
						<p class="text-xs text-gray-400">{group.label}</p>
						{#each group.tags as tag}
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									name="tagIds"
									value={tag.id}
									checked={tagSet.has(tag.id)}
									class="rounded"
								/>
								<span class="text-sm text-gray-700">{tag.name}</span>
							</label>
						{/each}
					</div>
				{/each}
				{#if data.tags.length === 0}
					<p class="text-xs text-gray-400">No tags yet.</p>
				{/if}
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
			>
				Save Changes
			</button>
		</div>
	</form>
</div>
