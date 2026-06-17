import React, { useState } from 'react';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Stack } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';
import useDeviceDetect from '../hooks/useDeviceDetect';

const SHOP_LINKS = [
	{ label: 'Dog Products', href: '/shop?typeList=DOG' },
	{ label: 'Cat Products', href: '/shop?typeList=CAT' },
	{ label: 'Bird Products', href: '/shop?typeList=BIRD' },
	{ label: 'Fish Products', href: '/shop?typeList=FISH' },
	{ label: 'Sale Items 🔥', href: '/shop?onSale=true' },
];

const QUICK_LINKS = [
	{ label: 'Contact Support', href: '/cs' },
	{ label: 'FAQs', href: '/cs?tab=faq' },
	{ label: 'Find a Seller', href: '/seller' },
	{ label: 'My Orders', href: '/mypage?tab=orders' },
];

const COMMUNITY_LINKS = [
	{ label: 'Free Board', href: '/community?articleCategory=FREE' },
	{ label: 'Recommendations', href: '/community?articleCategory=RECOMMEND' },
	{ label: 'Find a Vet 🩺', href: '/vet' },
	{ label: 'Pet News', href: '/community?articleCategory=NEWS' },
];

const SOCIAL_ICONS = [
	{ icon: <FacebookOutlinedIcon />, label: 'Facebook' },
	{ icon: <TelegramIcon />, label: 'Telegram' },
	{ icon: <InstagramIcon />, label: 'Instagram' },
	{ icon: <TwitterIcon />, label: 'Twitter' },
	{ icon: <YouTubeIcon />, label: 'YouTube' },
];

const Footer = () => {
	const device = useDeviceDetect();
	const [email, setEmail] = useState('');

	const handleSubscribe = () => {
		if (email.trim()) {
			setEmail('');
		}
	};

	if (device === 'mobile') {
		return (
			<footer id="footer">
				<Stack className={'footer-container'}>
					<Stack className={'footer-brand'}>
						<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'footer-logo'} />
						<p className={'footer-tagline'}>Your pet's happy place 🐾</p>
						<div className={'social-icons'}>
							{SOCIAL_ICONS.map((s) => (
								<span key={s.label} className={'social-icon'}>
									{s.icon}
								</span>
							))}
						</div>
					</Stack>
					<Stack className={'footer-bottom'}>
						<span>© Petoria {moment().year()}. All rights reserved.</span>
					</Stack>
				</Stack>
			</footer>
		);
	}

	return (
		<footer id="footer">
			<Stack className={'footer-container'}>
				{/* Newsletter banner */}
				<div className={'footer-newsletter'}>
					<div className={'newsletter-text'}>
						<strong>Stay up to date with Petoria</strong>
						<span>Get pet care tips, exclusive deals and new arrivals straight to your inbox.</span>
					</div>
					<div className={'newsletter-form'}>
						<input
							type="email"
							placeholder={'Enter your email address'}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
						/>
						<button onClick={handleSubscribe}>Subscribe</button>
					</div>
				</div>

				{/* Main footer body */}
				<div className={'footer-body'}>
					{/* Brand column */}
					<div className={'footer-brand-col'}>
						<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'footer-logo'} />
						<p className={'footer-tagline'}>Your pet's happy place 🐾</p>
						<div className={'footer-contact'}>
							<span className={'contact-label'}>Customer Care (24/7)</span>
							<a href="tel:+821021220202" className={'contact-value'}>
								+82 10 2122 0202
							</a>
							<span className={'contact-label'}>Email Support</span>
							<a href="mailto:hello@petoria.com" className={'contact-value'}>
								hello@petoria.com
							</a>
						</div>
						<div className={'social-icons'}>
							{SOCIAL_ICONS.map((s) => (
								<span key={s.label} className={'social-icon'} title={s.label}>
									{s.icon}
								</span>
							))}
						</div>
					</div>

					{/* Shop links */}
					<div className={'footer-links-col'}>
						<strong className={'col-title'}>Shop</strong>
						{SHOP_LINKS.map((link) => (
							<Link href={link.href} key={link.href}>
								<span className={'footer-link'}>{link.label}</span>
							</Link>
						))}
					</div>

					{/* Quick links */}
					<div className={'footer-links-col'}>
						<strong className={'col-title'}>Quick Links</strong>
						{QUICK_LINKS.map((link) => (
							<Link href={link.href} key={link.href}>
								<span className={'footer-link'}>{link.label}</span>
							</Link>
						))}
						<span className={'footer-link muted'}>Terms of Use</span>
						<span className={'footer-link muted'}>Privacy Policy</span>
					</div>

					{/* Community links */}
					<div className={'footer-links-col'}>
						<strong className={'col-title'}>Community</strong>
						{COMMUNITY_LINKS.map((link) => (
							<Link href={link.href} key={link.href}>
								<span className={'footer-link'}>{link.label}</span>
							</Link>
						))}
					</div>
				</div>

				{/* Copyright bar */}
				<div className={'footer-copyright'}>
					<span>© Petoria {moment().year()}. All rights reserved.</span>
					<div className={'footer-legal'}>
						<span>Privacy</span>
						<span>·</span>
						<span>Terms</span>
						<span>·</span>
						<span>Sitemap</span>
					</div>
				</div>
			</Stack>
		</footer>
	);
};

export default Footer;
