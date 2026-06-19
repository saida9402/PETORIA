import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';

const GRAPHQL_URI =
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
	`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/graphql`;
const WS_URI = process.env.NEXT_PUBLIC_API_WS || 'ws://localhost:3002';


let apolloClient: ApolloClient<NormalizedCacheObject>;

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// Custom WebSocket client — token is sent via HttpOnly cookie during the HTTP
// upgrade handshake (same-site), so no URL query param is needed.
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(url);
		socketVar(this.socket);

		this.socket.onerror = () => {
			// WebSocket unavailable in dev without backend
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		// Auth is carried by the HttpOnly cookie sent automatically with every
		// credentialed request — no Authorization header needed.
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					// Required by Apollo Server v4 CSRF prevention for multipart uploads
					'apollo-require-preflight': 'true',
				},
			}));
			return forward(operation);
		});

		const link = createUploadLink({
			uri: GRAPHQL_URI,
			headers: { 'apollo-require-preflight': 'true' },
			credentials: 'include',
			fetch,
		}) as unknown as ApolloLink;

		// Open the chat socket directly so it is not subject to the
		// subscriptions-transport-ws connection_init/connection_ack handshake.
		// Without this, subscriptions-transport-ws closes and reopens the socket
		// every 30 s (its connection_ack timeout) against the NestJS WsAdapter,
		// which does not speak the GraphQL subscriptions protocol, causing all
		// chat clients to cycle through disconnect/reconnect every 30 seconds.
		const chatSocket = new WebSocket(WS_URI);
		chatSocket.onerror = () => {};
		socketVar(chatSocket);

		/* WEBSOCKET SUBSCRIPTION LINK */
		// lazy: true — only connects when an actual subscription operation is sent.
		// Since this app has no GraphQL subscription operations, the WS connection
		// opened above for chat is the only one; WebSocketLink never activates.
		const wsLink = new WebSocketLink({
			uri: WS_URI,
			options: {
				lazy: true,
				reconnect: true,
				timeout: 30000,
				connectionParams: () => ({}),
			},
			webSocketImpl: LoggingWebSocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
			if (graphQLErrors) {
				graphQLErrors.forEach(({ message, locations, path }) => {
					console.error(
						`[GraphQL error] op=${operation.operationName} msg=${message} path=${path} loc=${JSON.stringify(
							locations,
						)}`,
					);
					// Surface every GraphQL error to the user — previously a substring filter
					// silently hid upload/validation errors and made bugs invisible.
					sweetErrorAlert(message);
				});
			}
			if (networkError) {
				console.error(`[Network error] op=${operation.operationName}:`, networkError);
				// @ts-ignore
				if (networkError?.statusCode === 401) {
					console.error('[Auth error]: Token expired or missing. Please log in again.');
				}
				sweetErrorAlert((networkError as any)?.message ?? 'Network error');
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
