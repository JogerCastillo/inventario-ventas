<script lang="ts">
	import { store } from '$lib/stores.svelte';
</script>

<div class="flex items-center gap-4">
	{#if store.statusMessage}
		<span class="text-xs font-medium text-indigo-500 animate-pulse">{store.statusMessage}</span>
	{/if}

	<div class="flex items-center gap-2 text-xs text-ink-muted">
		<span
			class="inline-block h-2 w-2 rounded-full"
			class:bg-emerald-400={store.dataSource === 'api'}
			class:bg-amber-400={store.dataSource === 'local'}
		></span>
		{store.dataSource === 'api' ? 'API conectada' : 'Operando en local'}
	</div>
</div>
