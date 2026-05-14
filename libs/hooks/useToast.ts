'use client';
import { useState, useCallback } from 'react';
export interface Toast {
	id: string;
	type: 'success' | 'error';
	message: string;
}
export function useToast() {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const add = useCallback((type: Toast['type'], message: string) => {
		const id = Date.now().toString();
		setToasts((p) => [...p, { id, type, message }]);
		setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
	}, []);
	return { toasts, success: (m: string) => add('success', m), error: (m: string) => add('error', m) };
}
