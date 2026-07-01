import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, Menu, MenuItem } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { getJwtToken, updateUserInfo, logOut } from '../../auth';
import { userVar } from '../../../apollo/store';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';

const drawerWidth = 280;

const PAGE_TITLES: Record<string, string> = {
	'/_admin/users':      'Member Management',
	'/_admin/product':    'Product Management',
	'/_admin/community':  'Community Management',
	'/_admin/orders':     'Order Management',
	'/_admin/cs/faq':     'FAQ Management',
	'/_admin/cs/notice':  'Notice Management',
};

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorElUser(event.currentTarget);
		};

		const handleCloseUserMenu = () => {
			setAnchorElUser(null);
		};

		const client = useApolloClient();
		const logoutHandler = () => logOut(client, router);

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		const pageTitle = PAGE_TITLES[router.pathname] ?? 'Dashboard';

		return (
			<main id="pc-wrap" className="petoria-admin">
				<Box component={'div'} sx={{ display: 'flex' }}>
					<AppBar
						position="fixed"
						sx={{
							width: `calc(100% - ${drawerWidth}px)`,
							ml: `${drawerWidth}px`,
							boxShadow: 'none',
							borderBottom: '1px solid #E8F0DE',
							background: '#fff',
						}}
					>
						<Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: 64 }}>
							{/* LEFT: page title */}
							<Stack direction="column" justifyContent="center">
								<Typography variant="caption" sx={{ color: '#9e9e9e', letterSpacing: 0.5 }}>
									Admin / {pageTitle}
								</Typography>
								<Typography
									variant="h6"
									component="h1"
									sx={{ color: '#2D5016', fontWeight: 700, lineHeight: 1.2 }}
								>
									{pageTitle}
								</Typography>
							</Stack>

							{/* RIGHT: actions */}
							<Stack direction="row" alignItems="center" spacing={2}>
								{/* View Site button */}
								<Button
									variant="outlined"
									size="small"
									href="/"
									target="_blank"
									rel="noopener noreferrer"
									sx={{
										borderColor: '#4E8A28',
										color: '#2D5016',
										fontWeight: 600,
										borderRadius: '8px',
										textTransform: 'none',
										px: 2,
										'&:hover': { background: '#F0F7E8', borderColor: '#2D5016' },
									}}
								>
									View Site
								</Button>

								{/* Avatar + user menu */}
								<Tooltip title="Open settings">
									<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
										<Avatar
											src={user?.memberImage ? `${API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
											sx={{ border: '2px solid #4E8A28' }}
										/>
									</IconButton>
								</Tooltip>
								<Menu
									sx={{ mt: '45px' }}
									id="menu-appbar"
									className={'pop-menu'}
									anchorEl={anchorElUser}
									anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
									keepMounted
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
									open={Boolean(anchorElUser)}
									onClose={handleCloseUserMenu}
								>
									<Box component={'div'} onClick={handleCloseUserMenu} sx={{ width: '200px' }}>
										<Stack sx={{ px: '20px', my: '12px' }}>
											<Typography variant={'h6'} component={'h6'} sx={{ mb: '4px', color: '#2D5016' }}>
												{user?.memberNick}
											</Typography>
											<Typography variant={'subtitle1'} component={'p'} color={'#757575'}>
												{user?.memberPhone}
											</Typography>
										</Stack>
										<Divider />
										<Box component={'div'} sx={{ p: 1, py: '6px' }} onClick={logoutHandler}>
											<MenuItem sx={{ px: '16px', py: '6px' }}>
												<Typography variant={'subtitle1'} component={'span'}>
													Logout
												</Typography>
											</MenuItem>
										</Box>
									</Box>
								</Menu>
							</Stack>
						</Toolbar>
					</AppBar>

					<Drawer
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': {
								width: drawerWidth,
								boxSizing: 'border-box',
								background: '#2D5016',
								color: '#E8F5D0',
							},
						}}
						variant="permanent"
						anchor="left"
						className="petoria-aside"
					>
						<Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
							<Stack className={'logo-box'} sx={{ mb: 2 }}>
								<Typography variant="h5" sx={{ color: '#A8CC7A', fontWeight: 700, letterSpacing: 1 }}>
									🐾 Petoria
								</Typography>
								<Typography variant="caption" sx={{ color: '#6DB535' }}>
									Admin Panel
								</Typography>
							</Stack>

							<Stack
								direction={'row'}
								alignItems={'center'}
								sx={{
									background: 'rgba(255,255,255,0.08)',
									borderRadius: '8px',
									px: '16px',
									py: '10px',
									width: '100%',
								}}
							>
								<Avatar
									src={user?.memberImage ? `${API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									sx={{ border: '2px solid #6DB535' }}
								/>
								<Typography variant={'body2'} sx={{ ml: 1.5, color: '#E8F5D0' }}>
									{user?.memberNick} <br />
									<span style={{ color: '#A8CC7A', fontSize: 11 }}>{user?.memberPhone}</span>
								</Typography>
							</Stack>
						</Toolbar>

						<Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

						<MenuList />
					</Drawer>

					<Box component={'div'} id="bunker" sx={{ flexGrow: 1, background: '#F5F9F0' }}>
						{/* Spacer so content isn't hidden behind fixed AppBar */}
						<Toolbar />
						{/*@ts-ignore*/}
						<Component {...props} />
					</Box>
				</Box>
			</main>
		);
	};
};

export default withAdminLayout;
