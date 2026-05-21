import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';

import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Top from '../Top';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/shop':
					title = 'Pet Shop';
					desc = 'Find everything your pet needs!';
					bgImage = '/img/banner/shop.svg';
					break;
				case '/shop/detail':
					title = 'Product Detail';
					desc = 'Premium quality for your pet';
					bgImage = '/img/banner/shop.svg';
					break;
				case '/vet':
					title = 'Veterinarians';
					desc = 'Trusted vets near you';
					bgImage = '/img/banner/vets.svg';
					break;
				case '/vet/detail':
					title = 'Vet Profile';
					desc = 'Book an appointment';
					bgImage = '/img/banner/vets.svg';
					break;
				case '/mypage':
					title = 'My Page';
					desc = 'Manage your account';
					bgImage = '/img/banner/mypage.svg';
					break;
				case '/community':
					title = 'Pet Community';
					desc = 'Share your pet stories';
					bgImage = '/img/banner/community.svg';
					break;
				case '/community/detail':
					title = 'Article Detail';
					desc = 'Pet Community';
					bgImage = '/img/banner/community.svg';
					break;
				case '/cs':
					title = 'Customer Support';
					desc = 'We are here to help!';
					bgImage = '/img/banner/cs.svg';
					break;
				case '/account/join':
					title = 'Login / Sign Up';
					desc = 'Welcome to Petoria 🐾';
					bgImage = '/img/banner/auth.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Profile';
					desc = 'Pet lover community';
					bgImage = '/img/banner/mypage.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>Petoria 🐾</title>
						<meta name={'title'} content={`Petoria - Your Pet's Happy Place`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Petoria 🐾</title>
						<meta name={'title'} content={`Petoria - Your Pet's Happy Place`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								backgroundImage: `url(${memoizedValues.bgImage})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								boxShadow: 'inset 10px 40px 150px 40px rgba(45, 80, 22, 0.85)',
							}}
						>
							<Stack className={'container'}>
								<strong style={{ color: '#E8F5D0' }}>{t(memoizedValues.title)}</strong>
								<span style={{ color: '#A8CC7A' }}>{t(memoizedValues.desc)}</span>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
