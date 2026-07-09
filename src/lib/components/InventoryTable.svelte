<script lang="ts">
	import { store, saveLocalData, showStatus, formatMoney } from '$lib/stores.svelte';
	import { deleteProduct, getProducts } from '$lib/api';

	let search = $state('');

	let filtered = $derived(
		store.products.filter(p => {
			if (!search) return true;
			const q = search.toLowerCase();
			return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
		})
	);

	async function handleEdit(product: typeof store.products[number]) {
		store.editingProduct = product;
	}

	async function handleDelete(id: string) {
		if (!confirm('Se eliminara el producto seleccionado.')) return;

		const hasSales = store.sales.some(s => s.productId === id);
		if (hasSales) {
			showStatus('No puedes eliminar este producto porque tiene ventas registradas.');
			return;
		}

		try {
			if (store.dataSource === 'api') {
				await deleteProduct(id);
				store.products = await getProducts();
			} else {
				store.products = store.products.filter(p => p.id !== id);
				saveLocalData();
			}
			showStatus('Producto eliminado');
		} catch (err) {
			showStatus(err instanceof Error ? err.message : 'No se pudo eliminar el producto.');
		}
	}

	function stockStatus(product: typeof store.products[number]): { text: string; cls: string } {
		if (product.stock <= 0) return { text: 'Sin stock', cls: 'status status--danger' };
		if (product.stock <= product.minStock) return { text: 'Stock bajo', cls: 'status status--warn' };
		return { text: 'Disponible', cls: 'status status--ok' };
	}
</script>

<div class="card p-5">
	<div class="mb-4 flex items-center justify-between gap-4 flex-wrap">
		<div>
			<h2 class="text-sm font-bold text-ink">Inventario actual</h2>
			<p class="mt-0.5 text-xs text-ink-muted">Busca por nombre, SKU o categoria.</p>
		</div>
		<input
			type="search"
			bind:value={search}
			placeholder="Buscar producto..."
			class="input max-w-xs"
		/>
	</div>

	<div class="overflow-auto rounded-lg border border-border">
		<table class="w-full min-w-[700px] border-collapse text-left text-sm">
			<thead>
				<tr>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Producto</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">SKU</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Categoria</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Precio</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Stock</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Estado</th>
					<th class="bg-surface-hover px-4 py-3 text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted border-b border-border">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as product}
					<tr class="border-b border-border/50 transition-colors last:border-0 hover:bg-surface-hover">
						<td class="px-4 py-3 font-medium text-ink">{product.name}</td>
						<td class="px-4 py-3 font-mono text-xs text-ink-muted">{product.sku}</td>
						<td class="px-4 py-3 text-ink-soft">{product.category}</td>
						<td class="px-4 py-3 font-mono text-ink-soft">{formatMoney(product.price)}</td>
						<td class="px-4 py-3 font-mono text-ink-soft">{product.stock}</td>
						<td class="px-4 py-3">
							<span class={stockStatus(product).cls}>{stockStatus(product).text}</span>
						</td>
						<td class="px-4 py-3">
							<div class="flex gap-1.5">
								<button type="button" class="btn btn--ghost !px-2 !py-1 !text-xs" onclick={() => handleEdit(product)}>Editar</button>
								<button type="button" class="btn btn--danger !px-2 !py-1 !text-xs" onclick={() => handleDelete(product.id)}>Eliminar</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="px-4 py-8 text-center text-sm text-ink-muted">
							{search ? 'No hay resultados para esta busqueda.' : 'No hay productos registrados.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
