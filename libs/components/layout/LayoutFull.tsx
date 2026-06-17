import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';

import Footer from '../Footer';
import { Stack } from '@mui/material';
import { hydrateUserFromStorage } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Top from '../Top';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		useEffect(() => {
			hydrateUserFromStorage();
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

export default withLayoutFull;
