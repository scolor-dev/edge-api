<script lang="ts">
	import { enhance } from "$app/forms"
	import { goto, invalidateAll } from "$app/navigation"
	import type { ActionData, PageData } from "./$types"

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const files = $derived(
		Object.entries(data.project.index?.files ?? {}).sort(([a], [b]) => a.localeCompare(b)),
	)
	const folders = $derived(
		Object.entries(data.project.index?.folders ?? {}).sort(([a], [b]) => a.localeCompare(b)),
	)

	const tree = $derived(
		[
			...folders.map(([path, meta]) => ({ type: "folder" as const, path, title: meta.title, uuid: null })),
			...files.map(([path, meta]) => ({ type: "file" as const, path, title: meta.title, uuid: meta.uuid })),
		].sort((a, b) => a.path.localeCompare(b.path)),
	)

	let selectedFolderPath = $state<string | null>(null)

	function selectFolder(path: string) {
		selectedFolderPath = path
		if (data.selectedFileId) goto("?", { replaceState: true })
	}

	let addDialog = $state<HTMLDialogElement | null>(null)
	let addType = $state<"file" | "folder">("file")
	let addParent = $state("")
	let addName = $state("")
	const addPath = $derived(
		addParent.trim() ? `${addParent.trim()}/${addName.trim()}` : addName.trim(),
	)
</script>

<div class="mx-auto max-w-5xl space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a
				href="/projects/{data.project.slug}"
				class="text-sm text-gray-400 hover:text-gray-700"
			>
				← {data.project.title}
			</a>
			<h1 class="text-lg font-semibold text-gray-800">Docs</h1>
		</div>
		<button
			type="button"
			onclick={() => addDialog?.showModal()}
			class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700"
		>
			+ Add
		</button>
	</div>

	{#if form?.message}
		<p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{form.message}</p>
	{/if}

	<div class="grid grid-cols-4 gap-4 items-start">
		<!-- File tree -->
		<div class="col-span-1 rounded-xl bg-white shadow-sm overflow-hidden">
			<div class="border-b border-gray-100 px-4 py-3">
				<p class="text-xs font-medium text-gray-500">Files</p>
			</div>
			<nav class="p-2">
				{#if tree.length === 0}
					<p class="px-2 py-6 text-center text-xs text-gray-400">No files yet.</p>
				{/if}
				{#each tree as item}
					{#if item.type === "folder"}
						<button
							type="button"
							onclick={() => selectFolder(item.path)}
							class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors {selectedFolderPath === item.path && !data.selectedFileId
								? 'bg-gray-100 text-gray-700'
								: 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}"
						>
							<span>📁</span>
							<span class="min-w-0 truncate font-mono">{item.path}</span>
						</button>
					{:else}
						<button
							type="button"
							onclick={() => goto(`?file=${item.uuid}`)}
							class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors {data.selectedFileId ===
							item.uuid
								? 'bg-gray-900 text-white'
								: 'text-gray-600 hover:bg-gray-50'}"
						>
							<span>📄</span>
							<span class="min-w-0 flex-1 truncate font-mono">{item.path}</span>
						</button>
					{/if}
				{/each}
			</nav>
		</div>

		<!-- Editor -->
		<div class="col-span-3">
			{#if data.selectedFile}
				<div class="rounded-xl bg-white shadow-sm overflow-hidden">
					<div class="flex items-center justify-between border-b border-gray-100 px-6 py-3">
						<p class="font-mono text-xs text-gray-500">{data.selectedFile.path}</p>
						<form
							method="POST"
							action="?/deleteFile"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === "success") {
										await goto(`/projects/${data.project.slug}/docs`)
									} else {
										await update({ reset: false })
									}
								}
							}}
						>
							<input type="hidden" name="fileId" value={data.selectedFileId} />
							<button type="submit" class="text-xs text-gray-400 hover:text-red-500">
								Delete
							</button>
						</form>
					</div>
					<form
						method="POST"
						action="?/updateFile"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === "success") await invalidateAll()
								else await update({ reset: false })
							}
						}}
						class="p-6 space-y-4"
					>
						<input type="hidden" name="fileId" value={data.selectedFileId} />
						<div class="space-y-1">
							<label for="file-title" class="text-xs font-medium text-gray-500">Title</label>
							<input
								id="file-title"
								name="title"
								value={data.selectedFile.meta.title}
								class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
							/>
						</div>
						<div class="space-y-1">
							<label for="file-content" class="text-xs font-medium text-gray-500">
								Content (Markdown)
							</label>
							<textarea
								id="file-content"
								name="content"
								rows="28"
								value={data.selectedFile.content ?? ""}
								class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-gray-400 resize-y"
							></textarea>
						</div>
						<div class="flex justify-end">
							<button
								type="submit"
								class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
							>
								Save
							</button>
						</div>
					</form>
				</div>
			{:else if selectedFolderPath && data.project.index?.folders[selectedFolderPath]}
				{@const folder = data.project.index.folders[selectedFolderPath]}
				<div class="rounded-xl bg-white shadow-sm overflow-hidden">
					<div class="flex items-center justify-between border-b border-gray-100 px-6 py-3">
						<p class="font-mono text-xs text-gray-500">{selectedFolderPath}</p>
						<form
							method="POST"
							action="?/deleteFolder"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === "success") {
										selectedFolderPath = null
										await invalidateAll()
									} else {
										await update({ reset: false })
									}
								}
							}}
						>
							<input type="hidden" name="folderPath" value={selectedFolderPath} />
							<button type="submit" class="text-xs text-gray-400 hover:text-red-500">
								Delete
							</button>
						</form>
					</div>
					<form
						method="POST"
						action="?/updateFolder"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === "success") await invalidateAll()
								else await update({ reset: false })
							}
						}}
						class="p-6 space-y-4"
					>
						<input type="hidden" name="folderPath" value={selectedFolderPath} />
						<div class="space-y-1">
							<label for="folder-title" class="text-xs font-medium text-gray-500">Title</label>
							<input
								id="folder-title"
								name="title"
								value={folder.title}
								class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
							/>
						</div>
						<div class="flex justify-end">
							<button
								type="submit"
								class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
							>
								Save
							</button>
						</div>
					</form>
				</div>
			{:else}
				<div class="rounded-xl bg-white p-16 shadow-sm text-center">
					<p class="text-sm text-gray-400">ファイルまたはフォルダを選択して編集</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Add dialog -->
<dialog
	bind:this={addDialog}
	onclose={() => { addType = "file"; addParent = ""; addName = "" }}
	class="m-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/30"
>
	<form
		method="POST"
		action="?/addFile"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === "success") {
					addDialog?.close()
					const uuid = (result.data as { uuid?: string } | undefined)?.uuid
					if (uuid) await goto(`?file=${uuid}`)
					else await invalidateAll()
				} else {
					await update({ reset: false })
				}
			}
		}}
		class="space-y-4"
	>
		<h2 class="text-sm font-semibold text-gray-800">Add</h2>

		<div class="space-y-1">
			<p class="text-xs font-medium text-gray-500">Type</p>
			<div class="flex gap-4">
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="radio" name="type" value="file" bind:group={addType} />
					File
				</label>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="radio" name="type" value="folder" bind:group={addType} />
					Folder
				</label>
			</div>
		</div>

		<div class="space-y-1">
			<label for="add-parent" class="text-xs font-medium text-gray-500">Parent Folder</label>
			<select
				id="add-parent"
				bind:value={addParent}
				class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
			>
				<option value="">/ (root)</option>
				{#each folders as [path]}
					<option value={path}>{path}</option>
				{/each}
			</select>
		</div>
		<div class="space-y-1">
			<label for="add-name" class="text-xs font-medium text-gray-500">Name *</label>
			<input
				id="add-name"
				bind:value={addName}
				required
				placeholder={addType === "file" ? "introduction" : "docs"}
				class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-gray-400"
			/>
			{#if addName.trim()}
				<p class="text-xs text-gray-400">→ {addPath}</p>
			{/if}
		</div>
		<input type="hidden" name="path" value={addPath} />

		<div class="space-y-1">
			<label for="add-title" class="text-xs font-medium text-gray-500">Title *</label>
			<input
				id="add-title"
				name="title"
				required
				placeholder="Introduction"
				class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
			/>
		</div>

		{#if addType === "file"}
			<div class="space-y-1">
				<label for="add-content" class="text-xs font-medium text-gray-500">
					Content (Markdown)
				</label>
				<textarea
					id="add-content"
					name="content"
					rows="6"
					class="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-gray-400 resize-y"
				></textarea>
			</div>
		{/if}

		<div class="flex justify-end gap-3">
			<button
				type="button"
				onclick={() => addDialog?.close()}
				class="text-sm text-gray-500 hover:text-gray-700"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
			>
				Add
			</button>
		</div>
	</form>
</dialog>
