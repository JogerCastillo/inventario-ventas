import { checkHealth, getMe, getProducts, getSales } from './api';
import { store, setAuth, restoreAuth, loadLocalData } from './stores.svelte';

export async function detectApi() {
	try {
		await checkHealth();
		store.dataSource = 'api';
	} catch {
		store.dataSource = 'local';
	}
}

export async function loadData() {
	if (store.dataSource === 'api') {
		restoreAuth();

		if (store.authToken && store.currentUser) {
			try {
				const me = await getMe();
				setAuth(store.authToken, me.user);
				store.products = await getProducts();
				store.sales = await getSales();
				return;
			} catch {
				setAuth('', null);
			}
		}

		store.products = [];
		store.sales = [];
		return;
	}

	loadLocalData();
}
