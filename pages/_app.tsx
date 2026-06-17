import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { themeVar } from '../libs/store/themeStore';
import { getJwtToken } from '../libs/auth';
import { userVar, initDomain } from '../apollo/store';
import { CART_KEY } from '../libs/cart';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	const currentTheme = useReactiveVar(themeVar);
	const router = useRouter();

	// Fix 4 — startup cleanup: if no auth token is present on load, remove any
	// stale per-user data so it cannot be inherited by the next account.
	useEffect(() => {
		if (!getJwtToken()) {
			localStorage.removeItem(CART_KEY);
		}
	}, []);

	// Fix 3 — cross-tab logout: the storage event fires in every tab except the
	// one that wrote the key. When another tab writes 'logout', clear this tab's
	// user state and redirect so the session cannot linger in background tabs.
	useEffect(() => {
		const handleCrossTabLogout = (e: StorageEvent) => {
			if (e.key !== 'logout') return;
			userVar(initDomain);
			localStorage.removeItem(CART_KEY);
			client.clearStore().catch(() => {});
			router.push('/');
		};
		window.addEventListener('storage', handleCrossTabLogout);
		return () => window.removeEventListener('storage', handleCrossTabLogout);
	}, [client, router]);

	useEffect(() => {
		if (currentTheme === 'dark') {
			document.documentElement.setAttribute('data-dark', '');
		} else {
			document.documentElement.removeAttribute('data-dark');
		}
	}, [currentTheme]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
