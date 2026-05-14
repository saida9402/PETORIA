'use client';
import { useState, useCallback } from 'react';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	qty: number;
	icon: string;
	type: string;
}

// Zustand yoki localStorage asosidagi sodda cart store
let _cart: CartItem[] = [];
const listeners: Array<() => void> = [];

const notify = () => listeners.forEach((fn) => fn());

export function useCart() {
	const [, rerender] = useState(0);

	const subscribe = useCallback(() => {
		const fn = () => rerender((n) => n + 1);
		listeners.push(fn);
		return () => {
			const i = listeners.indexOf(fn);
			if (i > -1) listeners.splice(i, 1);
		};
	}, []);

	const addToCart = useCallback((item: Omit<CartItem, 'id' | 'qty'>) => {
		const ex = _cart.find((i) => i.name === item.name);
		if (ex) {
			ex.qty++;
		} else {
			_cart.push({ ...item, id: Date.now().toString(), qty: 1 });
		}
		notify();
	}, []);

	const updateQty = useCallback((id: string, delta: number) => {
		const item = _cart.find((i) => i.id === id);
		if (item) {
			item.qty = Math.max(1, Math.min(99, item.qty + delta));
			notify();
		}
	}, []);

	const removeItem = useCallback((id: string) => {
		_cart = _cart.filter((i) => i.id !== id);
		notify();
	}, []);

	const clearCart = useCallback(() => {
		_cart = [];
		notify();
	}, []);

	const totalItems = _cart.reduce((s, i) => s + i.qty, 0);
	const totalPrice = _cart.reduce((s, i) => s + i.price * i.qty, 0);

	return { cart: _cart, totalItems, totalPrice, addToCart, updateQty, removeItem, clearCart, subscribe };
}
