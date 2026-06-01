import React from 'react';
import UserAvatar from '../common/UserAvatar';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, Chip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorefrontIcon from '@mui/icons-material/Storefront';

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const pathname = router.query.category ?? 'myProfile';
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') {
		return <div>MY MENU MOBILE</div>;
	} else {
		return (
			<Stack width={'100%'}>
				{/* Profile / Store header */}
				{user?.memberType === 'SELLER' ? (
					<div className="mymenu-store">
						<div className="mymenu-store__banner" />
						<div className="mymenu-store__body">
							<div className="mymenu-store__avatar-wrap">
								<UserAvatar
									src={user?.memberImage ? `${API_URL}/${user?.memberImage}` : null}
									alt={user?.memberNick ?? ''}
									className="mymenu-store__avatar"
								/>
								<span className="mymenu-store__verified">✓</span>
							</div>
							<Typography className="mymenu-store__name">{user?.memberNick}</Typography>
							<Chip label="Verified Store" size="small" className="mymenu-store__chip" />
							<div className="mymenu-store__stats">
								<div className="mymenu-store__stat">
									<strong>{user?.memberLikes ?? 0}</strong>
									<span>Likes</span>
								</div>
								<div className="mymenu-store__stat">
									<strong>{user?.memberLikes ?? 0}</strong>
									<span>Likes</span>
								</div>
								<div className="mymenu-store__stat">
									<strong>{user?.memberViews ?? 0}</strong>
									<span>Views</span>
								</div>
							</div>
							<Link href={`/seller/${user?._id}`} className="mymenu-store__view-link">
								<StorefrontIcon sx={{ fontSize: 13 }} />
								View My Store
							</Link>
						</div>
					</div>
				) : (
					<Stack className={'profile'}>
						<Box component={'div'} className={'profile-img'}>
							<UserAvatar
								src={user?.memberImage ? `${API_URL}/${user?.memberImage}` : null}
								alt={user?.memberNick ?? ''}
							/>
						</Box>
						<Stack className={'user-info'}>
							<Typography className={'user-name'}>{user?.memberNick}</Typography>
							<Box component={'div'} className={'user-phone'}>
								<img src={'/img/icons/call.svg'} alt={'icon'} />
								<Typography className={'p-number'}>{user?.memberPhone}</Typography>
							</Box>
							{user?.memberType === 'ADMIN' ? (
								<a href="/_admin/users" target={'_blank'}>
									<Typography className={'view-list'}>{user?.memberType}</Typography>
								</a>
							) : (
								<Typography className={'view-list'}>{user?.memberType}</Typography>
							)}
						</Stack>
					</Stack>
				)}

				<Stack className={'sections'}>
					{/* SELLER menu items */}
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							🛍 MY SHOP
						</Typography>
						<List className={'sub-section'}>
							{user.memberType === 'SELLER' && (
								<>
									{/* Dashboard shortcut */}
									<ListItem>
										<Link href="/seller/dashboard" style={{ width: '100%' }}>
											<div className="flex-box mymenu-dashboard-link">
												<DashboardIcon sx={{ fontSize: 16, color: 'inherit', flexShrink: 0 }} />
												<Typography className="sub-title" variant="subtitle1" component="p">
													Dashboard
												</Typography>
											</div>
										</Link>
									</ListItem>

									<ListItem className={pathname === 'addProduct' ? 'focus' : ''}>
										<Link href={{ pathname: '/mypage', query: { category: 'addProduct' } }} scroll={false}>
											<div className={'flex-box'}>
												{category === 'addProduct' ? (
													<img className={'com-icon'} src={'/img/icons/whiteTab.svg'} alt={''} />
												) : (
													<img className={'com-icon'} src={'/img/icons/newTab.svg'} alt={''} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													Add Product
												</Typography>
											</div>
										</Link>
									</ListItem>

									<ListItem className={pathname === 'myProducts' ? 'focus' : ''}>
										<Link href={{ pathname: '/mypage', query: { category: 'myProducts' } }} scroll={false}>
											<div className={'flex-box'}>
												{category === 'myProducts' ? (
													<img className={'com-icon'} src={'/img/icons/homeWhite.svg'} alt={''} />
												) : (
													<img className={'com-icon'} src={'/img/icons/home.svg'} alt={''} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													My Products
												</Typography>
											</div>
										</Link>
									</ListItem>
								</>
							)}

							{/* My Orders */}
							<ListItem className={pathname === 'myOrders' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'myOrders' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'myOrders' ? (
											<img className={'com-icon'} src={'/img/icons/likeWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/like.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Orders
										</Typography>
									</div>
								</Link>
							</ListItem>

							{/* My Favorites */}
							<ListItem className={pathname === 'myFavorites' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'myFavorites' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'myFavorites' ? (
											<img className={'com-icon'} src={'/img/icons/likeWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/like.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Favorites
										</Typography>
									</div>
								</Link>
							</ListItem>

							{/* Recently Viewed */}
							<ListItem className={pathname === 'recentlyViewed' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'recentlyViewed' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'recentlyViewed' ? (
											<img className={'com-icon'} src={'/img/icons/searchWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/search.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Recently Viewed
										</Typography>
									</div>
								</Link>
							</ListItem>

							{/* Followers */}
							<ListItem className={pathname === 'followers' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'followers' } }} scroll={false}>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followers' ? 'white' : '#2D5016'}
											height="16px"
											width="16px"
											viewBox="0 0 328 328"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g>
												<path d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z" />
												<path d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z" />
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Followers
										</Typography>
									</div>
								</Link>
							</ListItem>

							{/* Followings */}
							<ListItem className={pathname === 'followings' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'followings' } }} scroll={false}>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followings' ? 'white' : '#2D5016'}
											height="16px"
											width="16px"
											viewBox="0 0 328 328"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g>
												<path d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z" />
												<path d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105C328,163.854,280.896,116.75,223,116.75z" />
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Followings
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>

					{/* Community */}
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							🐾 COMMUNITY
						</Typography>
						<List className={'sub-section'}>
							<ListItem className={pathname === 'myArticles' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'myArticles' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'myArticles' ? (
											<img className={'com-icon'} src={'/img/icons/discoveryWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/discovery.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Articles
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem className={pathname === 'writeArticle' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'writeArticle' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'writeArticle' ? (
											<img className={'com-icon'} src={'/img/icons/whiteTab.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/newTab.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Write Article
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>

					{/* Manage Account */}
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							⚙️ MANAGE ACCOUNT
						</Typography>
						<List className={'sub-section'}>
							<ListItem className={pathname === 'myProfile' ? 'focus' : ''}>
								<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false}>
									<div className={'flex-box'}>
										{category === 'myProfile' ? (
											<img className={'com-icon'} src={'/img/icons/userWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/user.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											My Profile
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem onClick={logoutHandler} sx={{ cursor: 'pointer' }}>
								<div className={'flex-box'}>
									<img className={'com-icon'} src={'/img/icons/logout.svg'} alt={''} />
									<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
										Logout
									</Typography>
								</div>
							</ListItem>
						</List>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default MyMenu;
