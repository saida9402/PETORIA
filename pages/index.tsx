import { NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutHome from '../libs/components/layout/LayoutHome';

import BrandsStrip from '../libs/components/homepage/BrandsStrip';
import CategoryGrid from '../libs/components/homepage/CategoryGrid';
import PopularProducts from '../libs/components/homepage/PopularProducts';
import PromoBanner from '../libs/components/homepage/PromoBanner';
import TrendProducts from '../libs/components/homepage/TrendProducts';
import Advertisement from '../libs/components/homepage/Advertisement';
import TopProducts from '../libs/components/homepage/TopProducts';
import VideoBanner from '../libs/components/homepage/VideoBanner';
import Events from '../libs/components/homepage/Events';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	const seoHead = (
		<Head>
			<title>Petoria — Your Pet&apos;s Happy Place</title>
			<meta
				name="description"
				content="Shop premium pet food, toys, medicine and accessories for dogs, cats, birds and fish at Petoria. Fast delivery, verified sellers, great prices."
			/>
			<meta property="og:title" content="Petoria — Your Pet's Happy Place" />
			<meta
				property="og:description"
				content="Shop premium pet food, toys, medicine and accessories for dogs, cats, birds and fish at Petoria. Fast delivery, verified sellers, great prices."
			/>
			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://petoria.com/" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="Petoria — Your Pet's Happy Place" />
			<meta
				name="twitter:description"
				content="Shop premium pet food, toys, medicine and accessories for dogs, cats, birds and fish at Petoria."
			/>
		</Head>
	);

	if (device === 'mobile') {
		return (
			<>
				{seoHead}
				<div className="home-page">
					<BrandsStrip />
					<CategoryGrid />
					<PopularProducts />
					<TrendProducts />
					<Advertisement />
					<TopProducts />
					<Events />
					<CommunityBoards />
				</div>
			</>
		);
	}

	return (
		<>
			{seoHead}
			<div className="home-page">
				<BrandsStrip />
				<CategoryGrid />
				<PopularProducts />
				<PromoBanner />
				<TrendProducts />
				<Advertisement />
				<TopProducts />
				<VideoBanner />
				<Events />
				<CommunityBoards />
			</div>
		</>
	);
};

export default withLayoutHome(Home);
