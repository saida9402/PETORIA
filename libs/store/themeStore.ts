import { makeVar } from '@apollo/client';

const saved =
	typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light' : 'light';

export const themeVar = makeVar<'light' | 'dark'>(saved);
