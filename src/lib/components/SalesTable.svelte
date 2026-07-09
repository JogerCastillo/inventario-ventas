<script lang="ts">
	import { store, formatMoney, formatDate } from '$lib/stores.svelte';

	let sorted = $derived(
		[...store.sales].sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime())
	);
</script>

<div class="card p-5">
	<div class="mb-4">
		<h2 class="text-sm font-bold text-ink">Historial de ventas</h2>
		<p class="mt-0.5 text-xs text-ink-muted">Registro cronologico para seguimiento comercial.</p>
	</div>

	<div class="overflow-auto rounded-lg border border-border">
		<table class="w-full min-w-[700px] border-collapse text-left text-sm">
			<thead>
				<tr>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Fecha</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Producto</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Cantidad</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Precio unitario</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each sorted as sale}
					<tr class="border-b border-border/50 transition-colors last:border-0 hover:bg-surface-hover">
						<td class="px-4 py-3 text-ink-soft">{formatDate(sale.date)}</td>
						<td class="px-4 py-3 font-medium text-ink">{sale.productName}</td>
						<td class="px-4 py-3 font-mono text-ink-soft">{sale.quantity}</td>
						<td class="px-4 py-3 font-mono text-ink-soft">{formatMoney(sale.unitPrice)}</td>
						<td class="px-4 py-3 font-mono font-semibold text-emerald-500 dark:text-emerald-400">{formatMoney(sale.total)}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-4 py-8 text-center text-sm text-ink-muted">
							Aun no hay ventas registradas.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
