import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';

import { Stack, Box } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const About: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>ABOUT PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				{/* Intro */}
				<Stack className={'intro'}>
					<Stack className={'container'}>
						<Stack className={'left'}>
							<strong>We're on a Mission to Make Every Pet's Life Better. 🐾</strong>
						</Stack>
						<Stack className={'right'}>
							<p>
								At Petoria, we believe every pet deserves the best — from nutritious food to fun toys and quality
								healthcare. We bring together the finest pet products from trusted brands, all in one place.
								<br />
								<br />
								Whether you're a dog parent, cat lover, bird enthusiast, or fish keeper, Petoria is your go-to
								destination for everything your pet needs to thrive.
							</p>
							<Stack className={'boxes'}>
								<div className={'box'}>
									<div>
										<img src="/img/icons/garden.svg" alt="" />
									</div>
									<span>Premium Products</span>
									<p>Only the highest quality products from trusted brands worldwide.</p>
								</div>
								<div className={'box'}>
									<div>
										<img src="/img/icons/securePayment.svg" alt="" />
									</div>
									<span>Secure Payment</span>
									<p>Safe and fast checkout with multiple payment options.</p>
								</div>
							</Stack>
						</Stack>
					</Stack>
				</Stack>

				{/* Statistics */}
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<Stack className={'banner'}>
							<img src="/img/banner/aboutPets.svg" alt="" />
						</Stack>
						<Stack className={'info'}>
							<Box component={'div'}>
								<strong>10K+</strong>
								<p>Happy Pet Owners</p>
							</Box>
							<Box component={'div'}>
								<strong>500+</strong>
								<p>Products Available</p>
							</Box>
							<Box component={'div'}>
								<strong>50+</strong>
								<p>Trusted Brands</p>
							</Box>
						</Stack>
					</Stack>
				</Stack>

				{/* Top Sellers */}
				<Stack className={'agents'}>
					<Stack className={'container'}>
						<span className={'title'}>Our Top Sellers</span>
						<p className={'desc'}>Meet the dedicated pet lovers behind Petoria</p>
						<Stack className={'wrap'}>{/* <SellerCard /> */}</Stack>
					</Stack>
				</Stack>

				{/* Options */}
				<Stack className={'options'}>
					<img src="/img/banner/aboutBanner.svg" alt="" className={'about-banner'} />
					<Stack className={'container'}>
						<strong>Let's find the right products for your pet</strong>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/security.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>🐶 Dog Care</span>
								<p>From premium dog food to cozy beds — everything your pup needs.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/keywording.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>🐱 Cat Essentials</span>
								<p>Toys, scratching posts, litter, and gourmet treats for your feline.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/investment.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>🐟 Aquatic & Birds</span>
								<p>Aquariums, bird cages, food and accessories for all exotic pets.</p>
							</div>
						</Stack>
						<Stack className={'btn'}>
							Shop Now
							<img src="/img/icons/rightup.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>

				{/* Partners */}
				<Stack className={'partners'}>
					<Stack className={'container'}>
						<span>Trusted by the world's best pet brands</span>
						<Stack className={'wrap'}>
							<img src="/img/icons/brands/royalcanin.svg" alt="Royal Canin" />
							<img src="/img/icons/brands/hills.svg" alt="Hill's" />
							<img src="/img/icons/brands/purina.svg" alt="Purina" />
							<img src="/img/icons/brands/kong.svg" alt="Kong" />
							<img src="/img/icons/brands/orijen.svg" alt="Orijen" />
						</Stack>
					</Stack>
				</Stack>

				{/* Help */}
				<Stack className={'help'}>
					<Stack className={'container'}>
						<Box component={'div'} className={'left'}>
							<strong>Need help? Talk to our pet experts.</strong>
							<p>Get advice from our team or browse through our full product catalog.</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'white'}>
								Contact Us
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
							<div className={'black'}>
								<img src="/img/icons/call.svg" alt="" />
								920 851 9087
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);
