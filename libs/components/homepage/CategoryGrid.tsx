import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import DiamondIcon from '@mui/icons-material/Diamond';
import { Dog, Cat, Bird, Fish } from 'phosphor-react';

// No color override — icons inherit color from .cats__item-icon CSS (var(--np))
// On hover, parent sets color: #fff via CSS, currentColor propagates to SVGs
const ICON_SX = { fontSize: 'inherit' } as const;

const CATS = [
	{ icon: <Dog  size={28} />, label: 'Dogs',        href: '/shop?type=DOG' },
	{ icon: <Cat  size={28} />, label: 'Cats',        href: '/shop?type=CAT' },
	{ icon: <Bird size={28} />, label: 'Birds',       href: '/shop?type=BIRD' },
	{ icon: <Fish size={28} />, label: 'Fish',        href: '/shop?type=FISH' },
	{ icon: <RestaurantIcon sx={ICON_SX} />,    label: 'Food',        href: '/shop?cat=FOOD' },
	{ icon: <LocalPharmacyIcon sx={ICON_SX} />, label: 'Medicine',    href: '/shop?cat=MEDICINE' },
	{ icon: <SportsEsportsIcon sx={ICON_SX} />, label: 'Toys',        href: '/shop?cat=TOY' },
	{ icon: <DiamondIcon sx={ICON_SX} />,       label: 'Accessories', href: '/shop?cat=ACCESSORY' },
];

const containerVariants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function CategoryGrid() {
	return (
		<section className="category-grid-section">
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Browse by type</p>
						<h2 className="section-hd__title">Shop by Category</h2>
					</div>
					<Link href="/shop" className="section-hd__link">
						View all products →
					</Link>
				</div>
				<motion.div
					className="cats__grid"
					variants={containerVariants}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: '-40px' }}
				>
					{CATS.map((c) => (
						<motion.div key={c.label} variants={itemVariants} whileHover={{ scale: 1.04 }}>
							<Link href={c.href} className="cats__item">
								<span className="cats__item-icon">{c.icon}</span>
								<span className="cats__item-name">{c.label}</span>
							</Link>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
