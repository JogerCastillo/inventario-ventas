import { store } from './stores.svelte';

const API_BASE = 'https://inventario-ventas-api.onrender.com/api';

function headers(extra: Record<string, string> = {}): Record<string, string> {
	const h: Record<string, string> = { ...extra };
	if (store.authToken) {
		h.Authorization = `Bearer ${store.authToken}`;
	}
	return h;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: headers(options.headers as Record<string, string> | undefined)
	});

	if (!res.ok) {
		let message = 'No se pudo completar la solicitud.';
		try {
			const payload = await res.json();
			message = payload.message || message;
		} catch { /* ignore */ }
		throw new Error(message);
	}

	if (res.status === 204) return null as T;
	return res.json();
}

export function checkHealth(): Promise<{ ok: boolean }> {
	return fetch(`${API_BASE}/health`).then(r => r.json());
}

export function loginApi(email: string, password: string): Promise<{ token: string; user: import('./types').User }> {
	return request('/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});
}

export function getMe(): Promise<{ user: import('./types').User }> {
	return request('/auth/me');
}

export function getProducts(): Promise<import('./types').Product[]> {
	return request('/products');
}

export function createProduct(data: Partial<import('./types').Product>): Promise<import('./types').Product> {
	return request('/products', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export function updateProduct(id: string, data: Partial<import('./types').Product>): Promise<import('./types').Product> {
	return request(`/products/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export function deleteProduct(id: string): Promise<null> {
	return request(`/products/${id}`, { method: 'DELETE' });
}

export function getSales(): Promise<import('./types').Sale[]> {
	return request('/sales');
}

export function createSale(data: { productId: string; quantity: number; date: string }): Promise<import('./types').Sale> {
	return request('/sales', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}
