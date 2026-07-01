import decodeJWT from 'jwt-decode';
import { ApolloClient } from '@apollo/client';
import { NextRouter } from 'next/router';
import { initializeApollo } from '../../apollo/client';
import { userVar, initDomain } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { CART_KEY } from '../cart';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
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

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
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
		memberBlocks: claims.memberBlocks ?? 0,
			memberProducts: claims.memberProducts ?? 0,
	};
	userVar(profile);
};

export const logOut = async (
	client: ApolloClient<any>,
	router: NextRouter,
): Promise<void> => {
	client.stop();
	deleteStorage();
	userVar(initDomain);
	await client.clearStore();
	router.push('/');
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem(CART_KEY);
	window.localStorage.setItem('logout', Date.now().toString());
};
