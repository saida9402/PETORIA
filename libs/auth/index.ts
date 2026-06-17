import decodeJWT from 'jwt-decode';
import { ApolloClient } from '@apollo/client';
import { NextRouter } from 'next/router';
import { initializeApollo } from '../../apollo/client';
import { userVar, initDomain } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP, LOGOUT } from '../../apollo/user/mutation';
import { CART_KEY } from '../cart';

// Non-sensitive user profile stored in localStorage for page-refresh hydration.
// The JWT itself lives in an HttpOnly cookie set by the backend and is never
// accessible to JavaScript.
const USER_PROFILE_KEY = 'userProfile';

function saveUserProfile(profile: CustomJwtPayload): void {
	try {
		localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
	} catch {
		// Storage unavailable (private browsing quota exceeded, etc.)
	}
}

export function loadUserProfile(): CustomJwtPayload | null {
	try {
		if (typeof window === 'undefined') return null;
		const raw = localStorage.getItem(USER_PROFILE_KEY);
		return raw ? (JSON.parse(raw) as CustomJwtPayload) : null;
	} catch {
		return null;
	}
}

export function hydrateUserFromStorage(): void {
	const profile = loadUserProfile();
	if (profile) userVar(profile);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const member = await requestLogin({ nick, password });

		if (member) {
			updateStorage({ jwtToken: member.accessToken });
			updateUserInfo(member.accessToken);
		}
	} catch (err) {
		deleteStorage();
		userVar(initDomain);
	}
};

const requestLogin = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ accessToken: string } & Record<string, any>> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		return result?.data?.login;
	} catch (err: any) {
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const member = await requestSignUp({ nick, password, phone, type });

		if (member) {
			updateStorage({ jwtToken: member.accessToken });
			updateUserInfo(member.accessToken);
		}
	} catch (err) {
		deleteStorage();
		userVar(initDomain);
	}
};

const requestSignUp = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ accessToken: string } & Record<string, any>> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		return result?.data?.signup;
	} catch (err: any) {
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const updateStorage = ({ jwtToken: _jwtToken }: { jwtToken: any }) => {
	// JWT is set as an HttpOnly cookie by the backend — never stored in localStorage.
	// This timestamp signals other tabs that a login occurred.
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	const profile: CustomJwtPayload = {
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	};
	userVar(profile);
	saveUserProfile(profile);
};

export const logOut = async (
	client: ApolloClient<any>,
	router: NextRouter,
): Promise<void> => {
	try {
		await client.mutate({ mutation: LOGOUT });
	} catch {
		// Non-fatal — proceed with client-side cleanup regardless
	}
	client.stop();
	deleteStorage();
	userVar(initDomain);
	await client.clearStore();
	router.push('/');
};

const deleteStorage = () => {
	localStorage.removeItem(USER_PROFILE_KEY);
	localStorage.removeItem(CART_KEY);
	window.localStorage.setItem('logout', Date.now().toString());
};
