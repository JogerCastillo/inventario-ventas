<script lang="ts">
	import { store, setAuth, showStatus, loadLocalData } from '$lib/stores.svelte';
	import { loginApi, getProducts, getSales } from '$lib/api';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || !password) return;

		loading = true;
		try {
			const res = await loginApi(email, password);
			setAuth(res.token, res.user);
			store.products = await getProducts();
			store.sales = await getSales();
			email = '';
			password = '';
			showStatus('Sesion iniciada');
		} catch (err) {
			showStatus(err instanceof Error ? err.message : 'Error al iniciar sesion');
		} finally {
			loading = false;
		}
	}

	function useLocalMode() {
		store.dataSource = 'local';
		loadLocalData();
		showStatus('Modo local activado');
	}
</script>

{#if store.dataSource === 'api' && !(store.currentUser && store.authToken)}
	<div class="card mx-auto max-w-md p-6">
		<div class="mb-5">
			<h2 class="text-base font-bold text-ink">Acceso al sistema</h2>
			<p class="mt-1 text-xs text-ink-muted">Inicia sesion para operar con la API.</p>
		</div>

		<form onsubmit={handleSubmit} class="grid gap-4">
			<div class="grid gap-1.5">
				<label for="auth-email" class="label">Correo</label>
				<input id="auth-email" type="email" bind:value={email} required placeholder="admin@inventario.local" class="input" />
			</div>
			<div class="grid gap-1.5">
				<label for="auth-password" class="label">Contrasena</label>
				<input id="auth-password" type="password" bind:value={password} required placeholder="******" class="input" />
			</div>
			<button type="submit" class="btn btn--primary" disabled={loading}>
				{loading ? 'Ingresando...' : 'Ingresar'}
			</button>
		</form>

		<div class="mt-4 border-t border-border pt-4">
			<button type="button" class="btn btn--secondary w-full text-xs" onclick={useLocalMode}>
				Usar modo local (sin API)
			</button>
		</div>
	</div>
{/if}
