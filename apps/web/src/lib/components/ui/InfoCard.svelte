<script lang="ts">
	let { label, value }: { label: string; value: string } = $props()
</script>

<div class="p-4 rounded-xl border border-gray-200 hover:border-sky-200 hover:bg-sky-50/50 transition-colors duration-200">
	<p class="text-xs uppercase tracking-wider text-sky-400 font-medium">{label}</p>
	<p class="text-gray-700 font-medium mt-1">{value}</p>
</div>
