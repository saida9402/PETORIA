import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Footer from '../Footer';
import HeroBanner from '../homepage/HeroBanner';
import HeaderFilter from '../homepage/HeaderFilter';
import WeatherBar from '../homepage/WeatherBar';
import { hydrateUserFromStorage } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Top from '../Top';

const withLayoutHome = (Component: any) => {
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
					<div id="mobile-wrap">
						<div id="top">
						<Top />
					</div>
						<WeatherBar />
						<HeroBanner />
						<div className="hero-filter-section">
							<HeaderFilter />
						</div>
						<main className="homepage-content">
							<Component {...props} />
						</main>
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
					<div id="top">
						<Top />
					</div>
					<WeatherBar />
					<HeroBanner />
					<div className="hero-filter-section">
						<HeaderFilter />
					</div>
					<main className="homepage-content">
						<Component {...props} />
					</main>
					<Chat />
					<Footer />
				</div>
			</>
		);
	};
};

export default withLayoutHome;
