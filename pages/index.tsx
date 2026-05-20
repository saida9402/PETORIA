import { NextPage } from 'next';
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

	if (device === 'mobile') {
		return (
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
		);
	}

	return (
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
	);
};

export default withLayoutHome(Home);
