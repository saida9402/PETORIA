import React from 'react';
import { NextPage } from 'next';
import { Stack, Box } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_SELLERS } from '../../apollo/user/query';
import SellerCard from '../../libs/components/common/SellerCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const About: NextPage = () => {
	const { data: getSellersData } = useQuery(GET_SELLERS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 6, sort: 'createdAt', search: {} } },
	});
	const sellers = getSellersData?.getSeller?.list ?? [];

	return (
		<Stack className={'about-page'}>
				{/* Intro */}
				<Stack className={'intro'}>
					<Stack className={'container'}>
						<Stack className={'left'}>
							<strong>We&apos;re on a Mission to Make Every Pet&apos;s Life Better. 🐾</strong>
						</Stack>
						<Stack className={'right'}>
							<p>
								At Petoria, we believe every pet deserves the best — from nutritious food to fun toys and quality
								healthcare. We bring together the finest pet products from trusted brands, all in one place.
								<br />
								<br />
								Whether you&apos;re a dog parent, cat lover, bird enthusiast, or fish keeper, Petoria is your go-to
								destination for everything your pet needs to thrive.
							</p>
							<Stack className={'boxes'}>
								<div className={'box'}>
									<div
										style={{
											fontSize: '32px',
											width: '77px',
											height: '70px',
											borderRadius: '50%',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											background: '#F6F6F6',
										}}
									>
										🌿
									</div>
									<span>Premium Products</span>
									<p>Only the highest quality products from trusted brands worldwide.</p>
								</div>
								<div className={'box'}>
									<div
										style={{
											fontSize: '32px',
											width: '77px',
											height: '70px',
											borderRadius: '50%',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											background: '#F6F6F6',
										}}
									>
										🔒
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
						<Stack className={'info'} style={{ marginTop: 0 }}>
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
						<Stack className={'wrap'}>
							{sellers.length > 0 ? (
								sellers.map((seller: any) => (
									<SellerCard key={seller._id} seller={seller} likeMemberHandler={() => {}} />
								))
							) : (
								<p style={{ color: '#888', textAlign: 'center', width: '100%' }}>
									No sellers yet — check back soon! 🐾
								</p>
							)}
						</Stack>
					</Stack>
				</Stack>

				{/* Options */}
				<Stack className={'options'}>
					<Stack className={'container'}>
						<strong>Let&apos;s find the right products for your pet</strong>
						<Stack className={'box'}>
							<div className={'icon-box'} style={{ fontSize: '28px' }}>
								🐶
							</div>
							<div className={'text-box'}>
								<span>Dog Care</span>
								<p>From premium dog food to cozy beds — everything your pup needs.</p>
							</div>
						</Stack>
						<Stack className={'box'}>
							<div className={'icon-box'} style={{ fontSize: '28px' }}>
								🐱
							</div>
							<div className={'text-box'}>
								<span>Cat Essentials</span>
								<p>Toys, scratching posts, litter, and gourmet treats for your feline.</p>
							</div>
						</Stack>
						<Stack className={'box'}>
							<div className={'icon-box'} style={{ fontSize: '28px' }}>
								🐟
							</div>
							<div className={'text-box'}>
								<span>Aquatic & Birds</span>
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
						<span>Trusted by the world&apos;s best pet brands</span>
						<Stack className={'wrap'}>
							{['Royal Canin', "Hill's", 'Purina', 'Kong', 'Orijen', 'Acana'].map((brand) => (
								<Link
									key={brand}
									href={`/shop?productBrand=${encodeURIComponent(brand)}`}
									style={{ textDecoration: 'none' }}
								>
									<div
										style={{
											padding: '10px 24px',
											border: '2px solid #4E8A28',
											borderRadius: '8px',
											fontWeight: 700,
											fontSize: '14px',
											color: '#4E8A28',
											background: 'white',
											cursor: 'pointer',
											transition: 'background 0.15s',
										}}
									>
										{brand}
									</div>
								</Link>
							))}
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
								+8210 2122 0102
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
	);
};

export default withLayoutBasic(About);
