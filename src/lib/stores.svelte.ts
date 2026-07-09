import type { Product, Sale, User, View } from './types';

function loadArray<T>(key: string): T[] {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

const STORAGE_PRODUCTS = 'inventario_ventas_productos';
const STORAGE_SALES = 'inventario_ventas_ventas';
const AUTH_TOKEN_KEY = 'inventario_ventas_auth_token';
const AUTH_USER_KEY = 'inventario_ventas_auth_user';

export const store = $state({
	authToken: '',
	currentUser: null as User | null,
	dataSource: 'local' as 'api' | 'local',
	currentView: 'dashboard' as View,
	products: [] as Product[],
	sales: [] as Sale[],
	editingProduct: null as Product | null,
	statusMessage: null as string | null
});

export function saveLocalData() {
	localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(store.products));
	localStorage.setItem(STORAGE_SALES, JSON.stringify(store.sales));
}

export function setAuth(token: string, user: User | null) {
	store.authToken = token;
	store.currentUser = user;

	if (token && user) {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
	} else {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
	}
}

export function restoreAuth() {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	const userRaw = localStorage.getItem(AUTH_USER_KEY);

	if (token && userRaw) {
		try {
			setAuth(token, JSON.parse(userRaw));
			return;
		} catch { /* ignore */ }
	}

	setAuth('', null);
}

export function seedLocalData() {
	if (store.products.length > 0) return;

	store.products = [
		{ id: 'p-1', name: 'Audifonos Pro X1', sku: 'AUD-X1', category: 'Tecnologia', price: 220000, stock: 14, minStock: 6, createdAt: new Date().toISOString() },
		{ id: 'p-2', name: 'Mouse Ergonomico M70', sku: 'MOU-M70', category: 'Accesorios', price: 98000, stock: 10, minStock: 5, createdAt: new Date().toISOString() },
		{ id: 'p-3', name: 'Teclado Mecanico K90', sku: 'KEY-K90', category: 'Perifericos', price: 310000, stock: 4, minStock: 4, createdAt: new Date().toISOString() }
	];

	store.sales = [
		{ id: 's-1', productId: 'p-1', productName: 'Audifonos Pro X1', quantity: 2, unitPrice: 220000, total: 440000, date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() }
	];

	saveLocalData();
}

export function loadLocalData() {
	store.products = loadArray<Product>(STORAGE_PRODUCTS);
	store.sales = loadArray<Sale>(STORAGE_SALES);
	seedLocalData();
}

export function formatMoney(value: number): string {
	return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0
	}).format(value || 0);
}

export function formatDate(isoDate: string): string {
	const date = new Date(isoDate + 'T00:00:00');
	if (Number.isNaN(date.getTime())) return isoDate;
	return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function showStatus(msg: string) {
	store.statusMessage = msg;
	setTimeout(() => { store.statusMessage = null; }, 4000);
}
