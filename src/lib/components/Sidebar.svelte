<script lang="ts">
	import { store, setAuth } from '$lib/stores.svelte';
	import { applyTheme, getStoredTheme, toggleTheme } from '$lib/theme';
	import type { View } from '$lib/types';

	let { sidebarCollapsed, toggleSidebar }: { sidebarCollapsed: boolean; toggleSidebar: () => void } = $props();

	let currentTheme = $state(getStoredTheme());

	const nav: { id: View; label: string; icon: string }[] = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ id: 'products', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
		{ id: 'sales', label: 'Ventas', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z' }
	];

	function handleThemeToggle() {
		currentTheme = toggleTheme();
	}

	function handleLogout() {
		setAuth('', null);
		store.products = [];
		store.sales = [];
	}
</script>

<aside
	class="flex flex-shrink-0 flex-col border-r border-border bg-surface-elevated transition-all duration-200 overflow-hidden"
	class:w-60={!sidebarCollapsed}
	class:w-16={sidebarCollapsed}
>
	<div class="flex items-center border-b border-border px-4" class:h-16={!sidebarCollapsed} class:h-14={sidebarCollapsed} class:justify-center={sidebarCollapsed}>
		{#if sidebarCollapsed}
			<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
				<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
		{:else}
			<div class="flex items-center gap-3">
				<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
					<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<div>
					<p class="text-[0.6rem] uppercase tracking-widest font-bold text-ink-muted">Inventario</p>
					<p class="text-sm font-bold text-ink -tracking-[0.01em]">StockFlow</p>
				</div>
			</div>
		{/if}
	</div>

	<nav class="flex-1 space-y-1 px-3 py-4">
		{#each nav as item}
			<button
				type="button"
				class={'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ' + (store.currentView === item.id ? 'bg-indigo-600/15 text-indigo-400 dark:text-indigo-400' : 'text-ink-muted hover:text-ink hover:bg-surface-hover')}
				class:justify-center={sidebarCollapsed}
				onclick={() => store.currentView = item.id}
				title={sidebarCollapsed ? item.label : ''}
			>
				<svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
				</svg>
				{#if !sidebarCollapsed}
					{item.label}
				{/if}
			</button>
		{/each}
	</nav>

	<div class="border-t border-border px-4 py-3" class:flex={sidebarCollapsed} class:justify-center={sidebarCollapsed}>
		{#if sidebarCollapsed}
			<button type="button" class="btn btn--ghost !px-2 !py-2" onclick={handleThemeToggle} title={currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
				{#if currentTheme === 'dark'}
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
				{:else}
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
				{/if}
			</button>
		{:else}
			<div class="flex items-center justify-between">
				{#if store.dataSource === 'api' && store.currentUser && store.authToken}
					<div class="text-xs text-ink-muted">
						<p class="font-semibold text-ink-soft">{store.currentUser.name}</p>
						<p>{store.currentUser.role}</p>
					</div>
				{:else}
					<div class="text-xs text-ink-muted">
						<p class="flex items-center gap-1.5">
							<span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
							Modo local
						</p>
					</div>
				{/if}
				<button type="button" class="btn btn--ghost !px-2 !py-2" onclick={handleThemeToggle} title={currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
					{#if currentTheme === 'dark'}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
					{:else}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
					{/if}
				</button>
			</div>
			{#if store.dataSource === 'api' && store.currentUser && store.authToken}
				<button type="button" class="btn btn--ghost w-full text-xs justify-start mt-2" onclick={handleLogout}>
					Cerrar sesion
				</button>
			{/if}
		{/if}
	</div>
</aside>
