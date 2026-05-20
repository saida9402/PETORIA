import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Footer from '../Footer';
import HeroBanner from '../homepage/HeroBanner';
import HeaderFilter from '../homepage/HeaderFilter';
import WeatherBar from '../homepage/WeatherBar';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Top from '../Top';

const withLayoutHome = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

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
					<div id="mobile-wrap">
						<Top />
						<WeatherBar />
						<HeroBanner />
						<div className="filter-section">
							<HeaderFilter />
						</div>
						<div id={'main'}>
							<Component {...props} />
						</div>
						<Footer />
					</div>
				</>
			);
		}

		return (
			<>
				<Head>
					<title>Petoria 🐾</title>
					<meta name={'title'} content={`Petoria - Your Pet's Happy Place`} />
				</Head>
				<div id="pc-wrap">
					<Top />
					<WeatherBar />
					<HeroBanner />
					<div className="filter-section">
						<HeaderFilter />
					</div>
					<div id={'main'}>
						<Component {...props} />
					</div>
					<Chat />
					<Footer />
				</div>
			</>
		);
	};
};

export default withLayoutHome;
