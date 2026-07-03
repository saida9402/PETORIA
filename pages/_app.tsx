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
import { userVar, initDomain, socketVar, notificationsVar, unreadNotifCountVar } from '../apollo/store';
import { CART_KEY } from '../libs/cart';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../apollo/user/query';

import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	const currentTheme = useReactiveVar(themeVar);
	const router = useRouter();

	// Fix 4 — startup cleanup: if no user profile is stored, remove any stale
	// per-user data so it cannot be inherited by the next account.
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

	// Listen for notification WebSocket events via addEventListener,
	// leaving Chat.tsx's existing socket.onmessage handler completely untouched.
	useEffect(() => {
		const socket = socketVar();
		if (!socket) return;

		const handleWsMessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);
				if (data.event === 'notification') {
					notificationsVar([data.data, ...notificationsVar()]);
					unreadNotifCountVar(unreadNotifCountVar() + 1);
				} else if (data.event === 'notificationCount') {
					unreadNotifCountVar(data.count ?? 0);
				}
			} catch {
				// ignore malformed messages
			}
		};

		socket.addEventListener('message', handleWsMessage);
		return () => socket.removeEventListener('message', handleWsMessage);
	}, [socketVar()]);

	// Fetch initial unread notification count when the user is authenticated.
	useEffect(() => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
		if (!token) return;
		client
			.query({ query: GET_UNREAD_NOTIFICATION_COUNT, fetchPolicy: 'network-only' })
			.then(({ data }) => {
				const count = data?.getUnreadNotificationCount ?? 0;
				unreadNotifCountVar(count);
			})
			.catch(() => {});
	}, []);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
				{/* ─── PETORIA FIX START (GOAL 1) ─── */}
				{/* DELETE: <NoticeModal /> — notices now go to bell dropdown only */}
				{/* ─── PETORIA FIX END (GOAL 1) ─── */}
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
