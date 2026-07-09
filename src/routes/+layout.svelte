<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import AuthPanel from '$lib/components/AuthPanel.svelte';
	import KpiGrid from '$lib/components/KpiGrid.svelte';
	import ProductForm from '$lib/components/ProductForm.svelte';
	import SaleForm from '$lib/components/SaleForm.svelte';
	import InventoryTable from '$lib/components/InventoryTable.svelte';
	import SalesTable from '$lib/components/SalesTable.svelte';
	import { store } from '$lib/stores.svelte';
	import { onMount } from 'svelte';
	import { detectApi, loadData } from '$lib/boot';
	import { applyTheme, getStoredTheme } from '$lib/theme';

	let { children } = $props();
	let ready = $state(false);
	let sidebarCollapsed = $state(false);

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	onMount(async () => {
		applyTheme(getStoredTheme());
		const mq = window.matchMedia('(max-width: 768px)');
		sidebarCollapsed = mq.matches;
		mq.addEventListener('change', (e) => { sidebarCollapsed = e.matches; });
		await detectApi();
		loadData();
		ready = true;
	});
</script>

{#if ready}
	<div class="flex h-screen overflow-hidden">
		<Sidebar {sidebarCollapsed} {toggleSidebar} />

		<main class="flex-1 flex flex-col overflow-hidden transition-all duration-200">
			<header class="flex items-center justify-between border-b border-border bg-surface-elevated/80 px-6 py-3">
				<div class="flex items-center gap-3">
					<button type="button" onclick={toggleSidebar} class="btn btn--ghost !px-2 !py-2">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							{#if sidebarCollapsed}
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
							{/if}
						</svg>
					</button>
					<div>
						<p class="text-[0.65rem] uppercase tracking-widest font-bold text-ink-muted">Panel comercial</p>
						<h1 class="text-lg font-extrabold text-ink -tracking-[0.02em]">
							{#if store.currentView === 'dashboard'}Dashboard
							{:else if store.currentView === 'products'}Productos
							{:else}Ventas{/if}
						</h1>
					</div>
				</div>
				<StatusBar />
			</header>

			<div class="flex-1 overflow-y-auto p-6">
				<AuthPanel />

				{#if store.dataSource === 'local' || (store.currentUser && store.authToken)}
					{#if store.currentView === 'dashboard'}
						<KpiGrid />
					{:else if store.currentView === 'products'}
						<div class="mx-auto max-w-3xl grid gap-6">
							<ProductForm />
							<InventoryTable />
						</div>
					{:else if store.currentView === 'sales'}
						<div class="mx-auto max-w-3xl grid gap-6">
							<SaleForm />
							<SalesTable />
						</div>
					{/if}
				{/if}
			</div>
		</main>
	</div>
{/if}

{@render children()}
