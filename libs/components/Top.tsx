import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { useApolloClient } from '@apollo/client';
import { Stack, Badge, InputBase, IconButton, Drawer, List, ListItemButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CaretDown } from 'phosphor-react';
import { Logout } from '@mui/icons-material';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar, chatOpenVar, onlineUsersVar } from '../../apollo/store';
import { themeVar } from '../store/themeStore';
import { API_URL } from '../config';
import { cartCount as readCartCount, subscribeCart } from '../cart';

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		borderRadius: 8,
		marginTop: theme.spacing(1),
		minWidth: 160,
		color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
		boxShadow:
			'rgb(255,255,255) 0px 0px 0px 0px, rgba(0,0,0,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 10px 15px -3px',
		'& .MuiMenu-list': { padding: '4px 0' },
		'& .MuiMenuItem-root': {
			fontSize: 14,
			'& .MuiSvgIcon-root': {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
			},
			'&:active': {
				backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
			},
		},
	},
}));

const NAV_LINKS = [
	{ label: 'Home', href: '/' },
	{ label: 'Shop', href: '/shop' },
	{ label: 'Vets', href: '/vet' },
	{ label: 'Community', href: '/community?articleCategory=FREE' },
	{ label: 'CS', href: '/cs' },
];

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const currentTheme = useReactiveVar(themeVar);
	const onlineCount = useReactiveVar(onlineUsersVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const client = useApolloClient();

	const toggleTheme = () => {
		const next = currentTheme === 'dark' ? 'light' : 'dark';
		themeVar(next);
		localStorage.setItem('theme', next);
	};

	const toggleChat = () => chatOpenVar(!chatOpenVar());

	const [scrolled, setScrolled] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string>('en');
	const [mobileOpen, setMobileOpen] = useState(false);
	const [cartCount, setCartCount] = useState(0);

	useEffect(() => {
		setCartCount(readCartCount());
		return subscribeCart(() => setCartCount(readCartCount()));
	}, []);
	const [bgColor, setBgColor] = useState(false);

	const langOpen = Boolean(langAnchor);
	const logoutOpen = Boolean(logoutAnchor);

	/** LIFECYCLES **/
	useEffect(() => {
		const stored = localStorage.getItem('locale');
		setLang(stored || 'en');
	}, [router]);

	useEffect(() => {
		setBgColor(router.pathname === '/shop/[id]');
	}, [router.pathname]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY >= 50);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	/** HANDLERS **/
	const langChoice = useCallback(
		async (e: React.MouseEvent<HTMLElement>) => {
			const chosen = e.currentTarget.id;
			setLang(chosen);
			localStorage.setItem('locale', chosen);
			setLangAnchor(null);
			await router.push(router.asPath, router.asPath, { locale: chosen });
		},
		[router],
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/shop?text=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery('');
		}
	};

	if (device === 'mobile') {
		return (
			<>
				<Stack className={'top mobile-top'}>
					{/* Logo */}
					<Link href={'/'}>
						<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'mobile-logo'} />
					</Link>

					<div className={'mobile-actions'}>
						<Link href={'/cart'}>
							<Badge badgeContent={cartCount} color="error" className={'cart-badge'}>
								<ShoppingCartOutlinedIcon sx={{ color: '#fff' }} />
							</Badge>
						</Link>
						<IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#fff' }}>
							<MenuIcon />
						</IconButton>
					</div>
				</Stack>

				<Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
					<div className={'mobile-drawer'}>
						<div className={'drawer-header'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" />
							<IconButton onClick={() => setMobileOpen(false)}>
								<CloseIcon />
							</IconButton>
						</div>
						<List>
							{NAV_LINKS.map((link) => (
								<ListItemButton key={link.href} onClick={() => { router.push(link.href); setMobileOpen(false); }}>
									{t(link.label)}
								</ListItemButton>
							))}
							{user?._id && (
								<ListItemButton onClick={() => { router.push('/mypage'); setMobileOpen(false); }}>
									{t('My Page')}
								</ListItemButton>
							)}
						</List>
						<div className={'drawer-auth'}>
							{user?._id ? (
								<Button onClick={() => { logOut(client, router); setMobileOpen(false); }} fullWidth variant="outlined" color="error">
									Logout
								</Button>
							) : (
								<Button onClick={() => { router.push('/account/join'); setMobileOpen(false); }} fullWidth variant="contained">
									{t('Login')} / {t('Register')}
								</Button>
							)}
						</div>
					</div>
				</Drawer>
			</>
		);
	}

	return (
		<Stack className={'top'}>
			<Stack className={`navbar ${scrolled || bgColor ? 'scrolled' : ''}`}>
				<Stack className={'nav-inner'}>
					{/* Logo */}
					<div className={'logo-box'}>
						<Link href={'/'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" />
						</Link>
					</div>

					{/* Nav Links */}
					<div className={'nav-links'}>
						{NAV_LINKS.map((link) => (
							<Link href={link.href} key={link.href}>
								<span className={router.pathname === link.href || (link.href !== '/' && router.pathname.startsWith(link.href.split('?')[0])) ? 'active' : ''}>
									{t(link.label)}
								</span>
							</Link>
						))}
						{user?._id && (
							<Link href={'/mypage'}>
								<span className={router.pathname === '/mypage' ? 'active' : ''}>{t('My Page')}</span>
							</Link>
						)}
					</div>

					{/* Center Search */}
					<form className={'search-bar'} onSubmit={handleSearch}>
						<InputBase
							className={'search-input'}
							placeholder={t('Search products...')}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<IconButton type="submit" className={'search-btn'}>
							<SearchIcon />
						</IconButton>
					</form>

					{/* Right Actions */}
					<div className={'nav-actions'}>
						{/* Language switcher */}
						<Button
							disableRipple
							className={'lang-btn'}
							onClick={(e) => setLangAnchor(e.currentTarget)}
							endIcon={<CaretDown size={12} color="#ccc" weight="fill" />}
						>
							<img src={`/img/flag/lang${lang}.png`} alt={lang} className={'flag-img'} />
						</Button>
						<StyledMenu anchorEl={langAnchor} open={langOpen} onClose={() => setLangAnchor(null)}>
							{[
								{ id: 'en', label: 'English', flag: 'langen.png' },
								{ id: 'kr', label: 'Korean', flag: 'langkr.png' },
								{ id: 'ru', label: 'Russian', flag: 'langru.png' },
							].map((item) => (
								<MenuItem key={item.id} disableRipple onClick={langChoice} id={item.id}>
									<img src={`/img/flag/${item.flag}`} alt={item.id} className={'flag-menu-img'} />
									{t(item.label)}
								</MenuItem>
							))}
						</StyledMenu>

						{/* Notifications */}
						{user?._id && (
							<IconButton className={'icon-btn'}>
								<NotificationsOutlinedIcon />
							</IconButton>
						)}

						{/* Cart */}
						<Link href={'/cart'}>
							<IconButton className={'icon-btn cart-btn'}>
								<Badge badgeContent={cartCount} color="error">
									<ShoppingCartOutlinedIcon />
								</Badge>
							</IconButton>
						</Link>

						{/* Chat */}
						<IconButton className={'icon-btn chat-btn'} onClick={toggleChat}>
							<Badge badgeContent={onlineCount} color="error" max={99}>
								<ChatBubbleOutlineRoundedIcon />
							</Badge>
						</IconButton>

						{/* User avatar / login + sign up */}
						{user?._id ? (
							<>
								<div
									className={'user-avatar'}
									onClick={(e: React.MouseEvent<HTMLDivElement>) => setLogoutAnchor(e.currentTarget)}
								>
									<img
										src={user?.memberImage ? `${API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
										alt="avatar"
									/>
								</div>
								<Menu
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => setLogoutAnchor(null)}
									sx={{ mt: '5px' }}
									transformOrigin={{ horizontal: 'right', vertical: 'top' }}
									anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
								>
									<MenuItem onClick={() => { router.push('/mypage'); setLogoutAnchor(null); }}>
										🐾 My Page
									</MenuItem>
									<MenuItem onClick={() => { logOut(client, router); setLogoutAnchor(null); }}>
										<Logout fontSize="small" sx={{ color: '#4E8A28', mr: 1 }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
								<Link href={'/account/join'}>
									<div className={'login-btn'}>
										<AccountCircleOutlinedIcon />
										<span>{t('Login')}</span>
									</div>
								</Link>
							</>
						)}

						{/* Dark mode toggle */}
						<IconButton className={'icon-btn theme-btn'} onClick={toggleTheme}>
							{currentTheme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
						</IconButton>
					</div>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);
