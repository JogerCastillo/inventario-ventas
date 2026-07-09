export interface Product {
	id: string;
	name: string;
	sku: string;
	category: string;
	price: number;
	stock: number;
	minStock: number;
	createdAt: string;
}

export interface Sale {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	total: number;
	date: string;
	createdAt: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export type View = 'dashboard' | 'products' | 'sales';
