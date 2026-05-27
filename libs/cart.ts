// Tiny shared cart store backed by localStorage.
// Single source of truth: detail page, navbar badge, and /cart page all read this.

export interface CartItem {
	productId: string;
	productName: string;
	productBrand: string;
	productImage: string;
	productPrice: number;
	productType: string;
	quantity: number;
}

export const CART_KEY = 'petoria_cart';
export const CART_EVENT = 'petoria-cart-update';

export function getCart(): CartItem[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
	} catch {
		return [];
	}
}

export function saveCart(items: CartItem[]) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(CART_KEY, JSON.stringify(items));
	window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1) {
	const items = getCart();
	const existing = items.find((it) => it.productId === item.productId);
	if (existing) {
		existing.quantity += qty;
	} else {
		items.push({ ...item, quantity: qty });
	}
	saveCart(items);
}

export function cartCount(): number {
	return getCart().reduce((sum, it) => sum + it.quantity, 0);
}

export function subscribeCart(fn: () => void): () => void {
	if (typeof window === 'undefined') return () => {};
	window.addEventListener(CART_EVENT, fn);
	window.addEventListener('storage', fn);
	return () => {
		window.removeEventListener(CART_EVENT, fn);
		window.removeEventListener('storage', fn);
	};
}
