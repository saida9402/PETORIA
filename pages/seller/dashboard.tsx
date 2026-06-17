import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Typography } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import GroupIcon from '@mui/icons-material/Group';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_SELLER_PRODUCTS, GET_MEMBER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { Product } from '../../libs/types/product/product';
import { Member } from '../../libs/types/member/member';
import { API_URL } from '../../libs/config';
import { T } from '../../libs/types/common';
import SellerDashboardCard from '../../libs/components/seller/SellerDashboardCard';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SellerDashboard: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [sellerData, setSellerData] = useState<Member | null>(null);
	const [recentProducts, setRecentProducts] = useState<Product[]>([]);
	const [totalActive, setTotalActive] = useState<number>(0);
	const [totalSold, setTotalSold] = useState<number>(0);

	const isSeller = !!user._id && user.memberType === 'SELLER';

	/** APOLLO REQUESTS **/
	useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user._id },
		skip: !isSeller,
		onCompleted: (data: T) => setSellerData(data?.getMember ?? null),
	});

	useQuery(GET_SELLER_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: { ...initialInput, search: { productStatus: 'ACTIVE' } } },
		skip: !isSeller,
		onCompleted: (data: T) => {
			setRecentProducts(data?.getSellerProducts?.list ?? []);
			setTotalActive(data?.getSellerProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	useQuery(GET_SELLER_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: { ...initialInput, search: { productStatus: 'SOLD' } } },
		skip: !isSeller,
		onCompleted: (data: T) => {
			setTotalSold(data?.getSellerProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) {
			router.replace('/account/join').then();
		} else if (user.memberType !== 'SELLER') {
			router.replace('/mypage').then();
		}
	}, [user]);

	return (
		<div id="seller-dashboard-page">
			<div className="container">
				{/* ── Welcome Banner ── */}
				<div className="sdp-welcome">
					<div className="sdp-welcome__avatar">
						<img
							src={user.memberImage ? `${API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
							alt="avatar"
						/>
					</div>
					<div className="sdp-welcome__text">
						<Typography className="sdp-welcome__name">
							Welcome back, {user.memberFullName || user.memberNick} 👋
						</Typography>
						<Typography className="sdp-welcome__sub">
							Here&apos;s your store overview for today.
						</Typography>
					</div>
					<Link href={`/seller/${user._id}`} className="sdp-welcome__view-store">
						<StorefrontIcon sx={{ fontSize: 16 }} />
						View My Store
					</Link>
				</div>

				{/* ── Stat Cards ── */}
				<div className="sdp-cards">
					<SellerDashboardCard
						icon={<Inventory2Icon />}
						label="Active Products"
						value={totalActive}
						sub="Currently listed"
						accentColor="var(--np, #4E8A28)"
					/>
					<SellerDashboardCard
						icon={<ListAltIcon />}
						label="Sold Out"
						value={totalSold}
						sub="Total sold items"
						accentColor="#F59E0B"
					/>
					<SellerDashboardCard
						icon={<GroupIcon />}
						label="Followers"
						value={sellerData?.memberFollowers ?? 0}
						sub="People following you"
						accentColor="#6366F1"
					/>
					<SellerDashboardCard
						icon={<RemoveRedEyeIcon />}
						label="Store Views"
						value={user.memberViews ?? 0}
						sub="Total profile views"
						accentColor="#0EA5E9"
					/>
					<SellerDashboardCard
						icon={<FavoriteIcon />}
						label="Likes Received"
						value={user.memberLikes ?? 0}
						sub="Total likes on store"
						accentColor="#EC4899"
					/>
				</div>

				{/* ── Quick Actions ── */}
				<div className="sdp-actions">
					<Typography className="sdp-section-title">Quick Actions</Typography>
					<div className="sdp-actions__grid">
						<Link href="/mypage?category=addProduct" className="sdp-action-btn sdp-action-btn--primary">
							<AddBoxIcon />
							<span>Add Product</span>
						</Link>
						<Link href="/seller/products" className="sdp-action-btn">
							<Inventory2Icon />
							<span>Manage Products</span>
						</Link>
						<Link href="/seller/settings" className="sdp-action-btn">
							<SettingsIcon />
							<span>Store Settings</span>
						</Link>
						<Link href="/mypage?category=myOrders" className="sdp-action-btn">
							<ListAltIcon />
							<span>My Orders</span>
						</Link>
					</div>
				</div>

				{/* ── Recent Products ── */}
				<div className="sdp-recent">
					<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
						<Typography className="sdp-section-title">Recent Products</Typography>
						<Link href="/seller/products" className="sdp-see-all">See all →</Link>
					</Stack>

					{recentProducts.length === 0 ? (
						<div className="no-data">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No products yet. Add your first product!</p>
						</div>
					) : (
						<div className="sdp-recent__list">
							{recentProducts.slice(0, 5).map((product: Product) => (
								<div key={product._id} className="sdp-recent__item">
									<div className="sdp-recent__item-img">
										<img
											src={
												product.productImages?.[0]
													? `${API_URL}/${product.productImages[0]}`
													: '/img/product/defaultProduct.svg'
											}
											alt={product.productName}
										/>
									</div>
									<div className="sdp-recent__item-info">
										<Typography className="sdp-recent__item-name">{product.productName}</Typography>
										<Typography className="sdp-recent__item-brand">{product.productBrand}</Typography>
									</div>
									<div className="sdp-recent__item-stats">
										<span className="sdp-recent__price">${product.productPrice.toLocaleString()}</span>
										<span className={`sdp-recent__status sdp-recent__status--${product.productStatus.toLowerCase()}`}>
											{product.productStatus}
										</span>
									</div>
									<div className="sdp-recent__item-meta">
										<span>👁 {product.productViews}</span>
										<span>❤️ {product.productLikes}</span>
										<span>📦 {product.productStock}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

SellerDashboard.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { productStatus: 'ACTIVE' },
	},
};

export default withLayoutBasic(SellerDashboard);
