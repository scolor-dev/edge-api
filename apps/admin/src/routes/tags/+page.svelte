<script lang="ts">
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import type { ActionData, PageData } from "./$types"

	let { data, form }: { data: PageData; form: ActionData } = $props()

	// Dialogs
	let catDialog = $state<HTMLDialogElement | null>(null)
	let tagDialog = $state<HTMLDialogElement | null>(null)

	// Category dialog
	let catMode = $state<"create" | "edit">("create")
	let catFields = $state({ id: "", name: "", slug: "" })
	let catSlugLocked = $state(false)

	// Tag dialog
	let tagMode = $state<"create" | "edit">("create")
	let tagFields = $state({ id: "", name: "", slug: "", category_id: "" })
	let tagSlugLocked = $state(false)

	// Tag filter — "all" | "none" | category id
	let filterCategoryId = $state("all")

	const toSlug = (s: string) =>
		s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

	function onCatNameInput(e: Event) {
		catFields.name = (e.target as HTMLInputElement).value
		if (!catSlugLocked) catFields.slug = toSlug(catFields.name)
	}

	function onTagNameInput(e: Event) {
		tagFields.name = (e.target as HTMLInputElement).value
		if (!tagSlugLocked) tagFields.slug = toSlug(tagFields.name)
	}

	function openCreateCat() {
		catMode = "create"
		catFields = { id: "", name: "", slug: "" }
		catSlugLocked = false
		catDialog?.showModal()
	}

	function openEditCat(cat: (typeof data.categories)[number]) {
		catMode = "edit"
		catFields = { id: cat.id, name: cat.name, slug: cat.slug }
		catSlugLocked = true
		catDialog?.showModal()
	}

	function openCreateTag() {
		tagMode = "create"
		tagFields = {
			id: "",
			name: "",
			slug: "",
			category_id: filterCategoryId !== "all" && filterCategoryId !== "none" ? filterCategoryId : "",
		}
		tagSlugLocked = false
		tagDialog?.showModal()
	}

	function openEditTag(tag: (typeof data.tags)[number]) {
		tagMode = "edit"
		tagFields = { id: tag.id, name: tag.name, slug: tag.slug, category_id: tag.category_id ?? "" }
		tagSlugLocked = true
		tagDialog?.showModal()
	}

	const filteredTags = $derived(
		filterCategoryId === "all"
			? data.tags
			: filterCategoryId === "none"
				? data.tags.filter((t) => !t.category_id)
				: data.tags.filter((t) => t.category_id === filterCategoryId),
	)
</script>

<div class="grid grid-cols-3 gap-6">
	<!-- Categories -->
	<div class="col-span-1 flex flex-col rounded-xl bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<div class="flex items-center gap-2">
				<h2 class="text-sm font-semibold text-gray-700">Categories</h2>
				<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
					{data.categories.length}
				</span>
			</div>
			<button
				onclick={openCreateCat}
				type="button"
				class="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
			>
				+ New
			</button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead
					class="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500"
				>
					<tr>
						<th class="px-4 py-3">Name</th>
						<th class="px-4 py-3">Slug</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each data.categories as cat}
						<tr class="group hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
							<td class="px-4 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
							<td class="px-4 py-3">
								<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
									<button
										onclick={() => openEditCat(cat)}
										type="button"
										aria-label="Edit {cat.name}"
										class="text-gray-400 hover:text-gray-700"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
										</svg>
									</button>
									<form method="POST" action="?/deleteCategory" use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === "success") await invalidateAll()
											else await update({ reset: false })
										}
									}}>
										<input type="hidden" name="id" value={cat.id} />
										<button type="submit" aria-label="Delete {cat.name}" class="text-gray-400 hover:text-red-500">
											<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="px-4 py-8 text-center text-gray-400" colspan="3">No categories yet.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Tags -->
	<div class="col-span-2 flex flex-col rounded-xl bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<div class="flex items-center gap-2">
				<h2 class="text-sm font-semibold text-gray-700">Tags</h2>
				<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
					{filteredTags.length}
				</span>
			</div>
			<button
				onclick={openCreateTag}
				type="button"
				class="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
			>
				+ New
			</button>
		</div>

		<!-- Category filter -->
		<div class="flex flex-wrap gap-1.5 border-b border-gray-100 px-6 py-3">
			{#each [{ id: "all", name: "All" }, { id: "none", name: "Uncategorized" }, ...data.categories] as f}
				<button
					type="button"
					onclick={() => (filterCategoryId = f.id)}
					class="rounded-full px-3 py-1 text-xs transition-colors {filterCategoryId === f.id
						? 'bg-gray-900 text-white'
						: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
				>
					{f.name}
				</button>
			{/each}
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead
					class="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500"
				>
					<tr>
						<th class="px-6 py-3">Name</th>
						<th class="px-6 py-3">Slug</th>
						<th class="px-6 py-3">Category</th>
						<th class="px-6 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each filteredTags as tag}
						<tr class="group hover:bg-gray-50">
							<td class="px-6 py-3 font-medium text-gray-800">{tag.name}</td>
							<td class="px-6 py-3 font-mono text-xs text-gray-400">{tag.slug}</td>
							<td class="px-6 py-3">
								{#if tag.category_name}
									<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
										{tag.category_name}
									</span>
								{:else}
									<span class="text-xs text-gray-300">—</span>
								{/if}
							</td>
							<td class="px-6 py-3">
								<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
									<button
										onclick={() => openEditTag(tag)}
										type="button"
										aria-label="Edit {tag.name}"
										class="text-gray-400 hover:text-gray-700"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
										</svg>
									</button>
									<form method="POST" action="?/deleteTag" use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === "success") await invalidateAll()
											else await update({ reset: false })
										}
									}}>
										<input type="hidden" name="id" value={tag.id} />
										<button type="submit" aria-label="Delete {tag.name}" class="text-gray-400 hover:text-red-500">
											<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="px-6 py-8 text-center text-gray-400" colspan="4">No tags found.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Category Dialog (create / edit) -->
<dialog bind:this={catDialog} class="m-auto w-full max-w-sm rounded-xl p-0 shadow-xl backdrop:bg-black/40">
	<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
		<h3 class="text-sm font-semibold text-gray-700">
			{catMode === "create" ? "New Category" : "Edit Category"}
		</h3>
		<button
			type="button"
			onclick={() => catDialog?.close()}
			class="text-gray-400 hover:text-gray-600"
			aria-label="Close"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	<form
		method="POST"
		action={catMode === "create" ? "?/createCategory" : "?/updateCategory"}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === "success") {
					await invalidateAll()
					catDialog?.close()
				} else {
					await update({ reset: false })
				}
			}
		}}
		class="space-y-4 p-6"
	>
		{#if form?.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{form.message}</p>
		{/if}
		{#if catMode === "edit"}
			<input type="hidden" name="id" value={catFields.id} />
		{/if}
		<div class="space-y-1">
			<label for="cat-name" class="text-xs font-medium text-gray-500">Name</label>
			<input
				id="cat-name"
				name="name"
				value={catFields.name}
				oninput={onCatNameInput}
				required
				class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
			/>
		</div>
		<div class="space-y-1">
			<label for="cat-slug" class="text-xs font-medium text-gray-500">Slug</label>
			<input
				id="cat-slug"
				name="slug"
				bind:value={catFields.slug}
				oninput={() => (catSlugLocked = true)}
				required
				class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-gray-400"
			/>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={() => catDialog?.close()}
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
			>
				Cancel
			</button>
			<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
				{catMode === "create" ? "Create" : "Save"}
			</button>
		</div>
	</form>
</dialog>

<!-- Tag Dialog (create / edit) -->
<dialog bind:this={tagDialog} class="m-auto w-full max-w-sm rounded-xl p-0 shadow-xl backdrop:bg-black/40">
	<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
		<h3 class="text-sm font-semibold text-gray-700">
			{tagMode === "create" ? "New Tag" : "Edit Tag"}
		</h3>
		<button
			type="button"
			onclick={() => tagDialog?.close()}
			class="text-gray-400 hover:text-gray-600"
			aria-label="Close"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	<form
		method="POST"
		action={tagMode === "create" ? "?/createTag" : "?/updateTag"}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === "success") {
					await invalidateAll()
					tagDialog?.close()
				} else {
					await update({ reset: false })
				}
			}
		}}
		class="space-y-4 p-6"
	>
		{#if form?.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{form.message}</p>
		{/if}
		{#if tagMode === "edit"}
			<input type="hidden" name="id" value={tagFields.id} />
		{/if}
		<div class="space-y-1">
			<label for="tag-name" class="text-xs font-medium text-gray-500">Name</label>
			<input
				id="tag-name"
				name="name"
				value={tagFields.name}
				oninput={onTagNameInput}
				required
				class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
			/>
		</div>
		<div class="space-y-1">
			<label for="tag-slug" class="text-xs font-medium text-gray-500">Slug</label>
			<input
				id="tag-slug"
				name="slug"
				bind:value={tagFields.slug}
				oninput={() => (tagSlugLocked = true)}
				required
				class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-gray-400"
			/>
		</div>
		<div class="space-y-1">
			<label for="tag-category" class="text-xs font-medium text-gray-500">Category</label>
			<select
				id="tag-category"
				name="category_id"
				bind:value={tagFields.category_id}
				class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
			>
				<option value="">No category</option>
				{#each data.categories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={() => tagDialog?.close()}
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
			>
				Cancel
			</button>
			<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
				{tagMode === "create" ? "Create" : "Save"}
			</button>
		</div>
	</form>
</dialog>
