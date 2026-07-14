import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, updateUserInfo, logOut } from '../auth';
import { useApolloClient } from '@apollo/client';
import { Stack, Badge, InputBase, IconButton, Drawer, List, ListItemButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import { CaretDown, MagnifyingGlass, ShoppingCart, Bell, List as HamburgerIcon, X, Moon, Sun, ChatCircle, UserCircle, SignOut } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar, chatOpenVar, onlineUsersVar, unreadNotifCountVar, unreadMsgCountVar } from '../../apollo/store';
// ─── PETORIA WEBSOCKET ADDITION START ───
import NotificationDropdown from './NotificationDropdown';
// ─── PETORIA WEBSOCKET ADDITION END ───
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
			'& .flag-menu-img': {
				width: 22,
				height: 16,
				borderRadius: 2,
				objectFit: 'cover',
				marginRight: theme.spacing(1),
			},
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
	// ─── PETORIA WEBSOCKET ADDITION START ───
	const unreadNotifCount = useReactiveVar(unreadNotifCountVar);
	const unreadMsgCount = useReactiveVar(unreadMsgCountVar);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	// ─── PETORIA WEBSOCKET ADDITION END ───
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
	const [searchOpen, setSearchOpen] = useState(false);
	const mobileSearchRef = useRef<HTMLInputElement>(null);
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

	const handleMobileSubmit = (e: React.FormEvent) => {
		handleSearch(e);
		if (searchQuery.trim()) setSearchOpen(false);
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setSearchOpen(false);
			setSearchQuery('');
		}
	};

	useEffect(() => {
		if (searchOpen && mobileSearchRef.current) {
			mobileSearchRef.current.focus();
		}
	}, [searchOpen]);

	if (device === 'mobile') {
		return (
			<>
				<div className={'mobile-nav-wrapper'}>
					<Stack className={'top mobile-top'}>
						{/* Logo */}
						<Link href={'/'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'mobile-logo'} />
						</Link>

						<div className={'mobile-actions'}>
							<IconButton
								onClick={() => setSearchOpen((prev) => !prev)}
								sx={{ color: '#fff' }}
								aria-label="Open search"
							>
								<MagnifyingGlass size={20} color="#fff" />
							</IconButton>
							<Link href={'/cart'}>
								<Badge badgeContent={cartCount} color="error" className={'cart-badge'}>
									<ShoppingCart size={22} color="#fff" />
								</Badge>
							</Link>
							<IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#fff' }} aria-label="Open menu">
								<HamburgerIcon size={22} color="#fff" />
							</IconButton>
						</div>
					</Stack>

					{searchOpen && (
						<div className={'mobile-search-bar'}>
							<form className={'mobile-search-form'} onSubmit={handleMobileSubmit}>
								<InputBase
									inputRef={mobileSearchRef}
									className={'mobile-search-input'}
									placeholder={t('Search products...')}
									value={searchQuery}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
									onKeyDown={handleSearchKeyDown}
									inputProps={{ 'aria-label': 'Search products' }}
								/>
								<IconButton type="submit" className={'mobile-search-btn'} aria-label="Submit search">
									<MagnifyingGlass size={20} />
								</IconButton>
								<IconButton
									onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
									className={'mobile-search-close'}
									aria-label="Close search"
								>
									<X size={20} />
								</IconButton>
							</form>
						</div>
					)}
				</div>

				<Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
					<div className={'mobile-drawer'}>
						<div className={'drawer-header'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" />
							<IconButton onClick={toggleTheme} sx={{ color: 'inherit' }} aria-label="Toggle dark mode">
								{currentTheme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
							</IconButton>
							<IconButton onClick={() => setMobileOpen(false)}>
								<X size={22} />
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
							<MagnifyingGlass size={20} />
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
							// ─── PETORIA WEBSOCKET ADDITION START ───
							<>
								<IconButton className={'icon-btn'} onClick={(e) => setNotifAnchor(e.currentTarget)}>
									<Badge badgeContent={unreadNotifCount} color="error" max={99}>
										<Bell size={22} />
									</Badge>
								</IconButton>
								<NotificationDropdown anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />
							</>
							// ─── PETORIA WEBSOCKET ADDITION END ───
						)}

						{/* Cart */}
						<Link href={'/cart'}>
							<IconButton className={'icon-btn cart-btn'}>
								<Badge badgeContent={cartCount} color="error">
									<ShoppingCart size={22} />
								</Badge>
							</IconButton>
						</Link>

						{/* Chat */}
						<IconButton className={'icon-btn chat-btn'} onClick={toggleChat}>
							<Badge badgeContent={unreadMsgCount} color="error" max={99}>
								<ChatCircle size={22} />
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
										<SignOut size={18} color="#4E8A28" style={{ marginRight: 8 }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
								<Link href={'/account/join'}>
									<div className={'login-btn'}>
										<UserCircle size={22} />
										<span>{t('Login')}</span>
									</div>
								</Link>
							</>
						)}

						{/* Dark mode toggle */}
						<IconButton className={'icon-btn theme-btn'} onClick={toggleTheme}>
							{currentTheme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
						</IconButton>

						{/* Hamburger — only visible at ≤768px via CSS */}
						<IconButton className={'icon-btn hamburger-btn'} onClick={() => setMobileOpen(true)}>
							<HamburgerIcon size={22} />
						</IconButton>
					</div>
				</Stack>
			</Stack>

			{/* Desktop-path Drawer (reuses same mobileOpen state) */}
			<Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
				<div className={'mobile-drawer'}>
					<div className={'drawer-header'}>
						<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" />
						<IconButton onClick={() => setMobileOpen(false)}>
							<X size={22} />
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
		</Stack>
	);
};

export default withRouter(Top);
