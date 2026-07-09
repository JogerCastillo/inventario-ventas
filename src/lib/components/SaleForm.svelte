<script lang="ts">
	import { store, saveLocalData, showStatus, formatMoney } from '$lib/stores.svelte';
	import { createSale, getSales, getProducts } from '$lib/api';

	let selectedProductId = $state('');
	let quantity = $state(1);
	let date = $state(new Date().toISOString().slice(0, 10));
	let saving = $state(false);
	let placeholderText = $derived(store.products.length === 0 ? 'No hay productos disponibles' : 'Selecciona un producto');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!selectedProductId) {
			showStatus('Selecciona un producto.');
			return;
		}
		if (quantity <= 0) {
			showStatus('Ingresa una cantidad valida.');
			return;
		}
		if (!date) {
			showStatus('Selecciona una fecha.');
			return;
		}

		saving = true;
		try {
			if (store.dataSource === 'api') {
				await createSale({ productId: selectedProductId, quantity, date });
				store.sales = await getSales();
				store.products = await getProducts();
			} else {
				const product = store.products.find(p => p.id === selectedProductId);
				if (!product) {
					showStatus('Producto no encontrado.');
					return;
				}
				if (quantity > product.stock) {
					showStatus('La cantidad supera el stock disponible.');
					return;
				}

				const sale = {
					id: crypto.randomUUID(),
					productId: product.id,
					productName: product.name,
					quantity,
					unitPrice: product.price,
					total: product.price * quantity,
					date,
					createdAt: new Date().toISOString()
				};

				product.stock -= quantity;
				store.sales = [...store.sales, sale];
				saveLocalData();
			}

			selectedProductId = '';
			quantity = 1;
			date = new Date().toISOString().slice(0, 10);
			showStatus('Venta registrada');
		} catch (err) {
			showStatus(err instanceof Error ? err.message : 'No se pudo registrar la venta.');
		} finally {
			saving = false;
		}
	}
</script>

<div class="card p-5">
	<div class="mb-4">
		<h2 class="text-sm font-bold text-ink">Registrar venta</h2>
		<p class="mt-0.5 text-xs text-ink-muted">Cada venta descuenta inventario y actualiza los indicadores.</p>
	</div>

	<form onsubmit={handleSubmit} class="grid gap-4">
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<div class="grid gap-1.5">
				<label for="sale-product" class="label">Producto</label>
				<select id="sale-product" bind:value={selectedProductId} required class="select" disabled={store.products.length === 0}>
					<option value="">{placeholderText}</option>
					{#each store.products as product}
						<option value={product.id}>
							{product.name} | Stock: {product.stock} | {formatMoney(product.price)}
						</option>
					{/each}
				</select>
			</div>
			<div class="grid gap-1.5">
				<label for="sale-quantity" class="label">Cantidad</label>
				<input id="sale-quantity" type="number" bind:value={quantity} required min="1" step="1" class="input" />
			</div>
			<div class="grid gap-1.5">
				<label for="sale-date" class="label">Fecha</label>
				<input id="sale-date" type="date" bind:value={date} required class="input" />
			</div>
		</div>

		<div class="flex gap-2 pt-1">
			<button type="submit" class="btn btn--primary" disabled={saving || store.products.length === 0}>
				{saving ? 'Registrando...' : 'Registrar venta'}
			</button>
		</div>
	</form>
</div>
