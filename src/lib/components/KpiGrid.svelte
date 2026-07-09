<script lang="ts">
	import { store, formatMoney } from '$lib/stores.svelte';

	let totalProducts = $derived(store.products.length);
	let totalStock = $derived(store.products.reduce((sum: number, p) => sum + p.stock, 0));
	let totalSales = $derived(store.sales.length);
	let totalIncome = $derived(store.sales.reduce((sum: number, s) => sum + s.total, 0));
	let lowStockCount = $derived(store.products.filter(p => p.stock <= p.minStock).length);
	let lowStockPercentage = $derived(totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0);
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
	<article class="card p-4">
		<p class="text-[0.65rem] uppercase tracking-wider font-semibold text-ink-muted">Productos activos</p>
		<strong class="mt-1 block text-2xl font-extrabold text-ink">{totalProducts}</strong>
	</article>
	<article class="card p-4">
		<p class="text-[0.65rem] uppercase tracking-wider font-semibold text-ink-muted">Stock total</p>
		<strong class="mt-1 block text-2xl font-extrabold text-ink">{totalStock}</strong>
	</article>
	<article class="card p-4">
		<p class="text-[0.65rem] uppercase tracking-wider font-semibold text-ink-muted">Ventas registradas</p>
		<strong class="mt-1 block text-2xl font-extrabold text-ink">{totalSales}</strong>
	</article>
	<article class="card p-4">
		<p class="text-[0.65rem] uppercase tracking-wider font-semibold text-ink-muted">Ingresos acumulados</p>
		<strong class="mt-1 block text-2xl font-extrabold text-ink">{formatMoney(totalIncome)}</strong>
	</article>
	<article class="card card--glow p-4 relative overflow-hidden">
		<div class="absolute right-2 top-2 text-[0.6rem] font-bold text-amber-500/60">{lowStockPercentage}%</div>
		<p class="text-[0.65rem] uppercase tracking-wider font-semibold text-ink-muted">Stock bajo</p>
		<strong class="mt-1 block text-2xl font-extrabold text-amber-500 dark:text-amber-400">{lowStockCount}</strong>
	</article>
</div>
