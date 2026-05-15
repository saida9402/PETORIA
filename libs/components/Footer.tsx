import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';

const Footer = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'logo'} />
							<p className={'tagline'}>🐾 Your pet's happy place</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Customer Care</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Follow us</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Petoria - All rights reserved. {moment().year()}</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						{/* Logo & tagline */}
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/petoriaLogoWhite.svg" alt="Petoria" className={'logo'} />
							<p className={'tagline'}>🐾 Your pet's happy place</p>
						</Box>

						{/* Contact */}
						<Box component={'div'} className={'footer-box'}>
							<span>Customer Care (24/7)</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Email Support</span>
							<p>hello@petoria.com</p>
						</Box>

						{/* Social */}
						<Box component={'div'} className={'footer-box'}>
							<p>Follow us on social media</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
								<YouTubeIcon />
							</div>
						</Box>
					</Stack>

					<Stack className={'right'}>
						{/* Newsletter */}
						<Box component={'div'} className={'top'}>
							<strong>🐾 Stay up to date with Petoria</strong>
							<p>Get pet care tips, deals, and new arrivals straight to your inbox.</p>
							<div>
								<input type="text" placeholder={'Your Email'} />
								<span>Subscribe</span>
							</div>
						</Box>

						{/* Links */}
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Shop</strong>
								<Link href="/shop?typeList=DOG"><span>Dog Products</span></Link>
								<Link href="/shop?typeList=CAT"><span>Cat Products</span></Link>
								<Link href="/shop?typeList=BIRD"><span>Bird Products</span></Link>
								<Link href="/shop?onSale=true"><span>Sale Items 🔥</span></Link>
							</div>
							<div>
								<strong>Quick Links</strong>
								<Link href="/cs"><span>Contact Support</span></Link>
								<Link href="/cs"><span>FAQs</span></Link>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
							</div>
							<div>
								<strong>Community</strong>
								<Link href="/community?articleCategory=FREE"><span>Free Board</span></Link>
								<Link href="/community?articleCategory=RECOMMEND"><span>Recommendations</span></Link>
								<Link href="/vet"><span>Find a Vet 🩺</span></Link>
								<Link href="/community?articleCategory=NEWS"><span>Pet News</span></Link>
							</div>
						</Box>
					</Stack>
				</Stack>

				<Stack className={'second'}>
					<span>© Petoria - All rights reserved. Petoria {moment().year()}</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
