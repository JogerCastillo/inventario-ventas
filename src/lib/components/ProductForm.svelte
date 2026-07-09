<script lang="ts">
	import { store, saveLocalData, showStatus } from '$lib/stores.svelte';
	import { createProduct, updateProduct, getProducts } from '$lib/api';

	let name = $state('');
	let sku = $state('');
	let category = $state('');
	let price = $state('');
	let stock = $state('');
	let minStock = $state('');
	let saving = $state(false);

	$effect(() => {
		if (store.editingProduct) {
			const p = store.editingProduct;
			name = p.name;
			sku = p.sku;
			category = p.category;
			price = String(p.price);
			stock = String(p.stock);
			minStock = String(p.minStock);
		}
	});

	function reset() {
		name = '';
		sku = '';
		category = '';
		price = '';
		stock = '';
		minStock = '';
		store.editingProduct = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!name || !sku || !category) {
			showStatus('Completa nombre, SKU y categoria.');
			return;
		}

		const priceNum = Number(price);
		const stockNum = Number(stock);
		const minStockNum = Number(minStock);

		if (Number.isNaN(priceNum) || priceNum < 0) {
			showStatus('Ingresa un precio valido.');
			return;
		}
		if (Number.isNaN(stockNum) || stockNum < 0) {
			showStatus('Ingresa un stock valido.');
			return;
		}
		if (Number.isNaN(minStockNum) || minStockNum < 0) {
			showStatus('Ingresa un stock minimo valido.');
			return;
		}

		const dupSku = store.products.some(p => p.sku === sku.trim().toUpperCase() && p.id !== store.editingProduct?.id);
		if (dupSku) {
			showStatus('El SKU ya existe en otro producto.');
			return;
		}

		saving = true;
		try {
			const data = { name: name.trim(), sku: sku.trim().toUpperCase(), category: category.trim(), price: priceNum, stock: stockNum, minStock: minStockNum };

			if (store.dataSource === 'api') {
				if (store.editingProduct) {
					await updateProduct(store.editingProduct.id, data);
				} else {
					await createProduct(data);
				}
				store.products = await getProducts();
			} else {
				if (store.editingProduct) {
					const idx = store.products.findIndex(p => p.id === store.editingProduct!.id);
					if (idx !== -1) {
						store.products[idx] = { ...store.products[idx], ...data };
					}
				} else {
					const newProduct = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
					store.products = [...store.products, newProduct];
				}
				saveLocalData();
			}

			reset();
			showStatus(store.editingProduct ? 'Producto actualizado' : 'Producto guardado');
		} catch (err) {
			showStatus(err instanceof Error ? err.message : 'No se pudo guardar el producto.');
		} finally {
			saving = false;
		}
	}
</script>

<div class="card p-5">
	<div class="mb-4">
		<h2 class="text-sm font-bold text-ink">
			{store.editingProduct ? 'Editar producto' : 'Nuevo producto'}
		</h2>
		<p class="mt-0.5 text-xs text-ink-muted">
			{store.editingProduct ? 'Actualiza los datos del producto.' : 'Registra un nuevo articulo en el inventario.'}
		</p>
	</div>

	<form onsubmit={handleSubmit} class="grid gap-4">
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<div class="grid gap-1.5">
				<label for="product-name" class="label">Nombre</label>
				<input id="product-name" bind:value={name} required maxlength="80" placeholder="Ej: Audifonos Pro X1" class="input" />
			</div>
			<div class="grid gap-1.5">
				<label for="product-sku" class="label">SKU</label>
				<input id="product-sku" bind:value={sku} required maxlength="24" placeholder="Ej: AUD-X1" class="input font-mono" />
			</div>
			<div class="grid gap-1.5">
				<label for="product-category" class="label">Categoria</label>
				<input id="product-category" bind:value={category} required maxlength="40" placeholder="Ej: Tecnologia" class="input" />
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<div class="grid gap-1.5">
				<label for="product-price" class="label">Precio unitario</label>
				<input id="product-price" type="number" bind:value={price} required min="0" step="100" placeholder="Ej: 120000" class="input" />
			</div>
			<div class="grid gap-1.5">
				<label for="product-stock" class="label">Stock inicial</label>
				<input id="product-stock" type="number" bind:value={stock} required min="0" step="1" placeholder="Ej: 30" class="input" />
			</div>
			<div class="grid gap-1.5">
				<label for="product-min-stock" class="label">Stock minimo</label>
				<input id="product-min-stock" type="number" bind:value={minStock} required min="0" step="1" placeholder="Ej: 8" class="input" />
			</div>
		</div>

		<div class="flex gap-2 pt-1">
			<button type="submit" class="btn btn--primary" disabled={saving}>
				{saving ? 'Guardando...' : store.editingProduct ? 'Actualizar producto' : 'Guardar producto'}
			</button>
			{#if store.editingProduct}
				<button type="button" class="btn btn--secondary" onclick={reset}>Cancelar edicion</button>
			{/if}
		</div>
	</form>
</div>
