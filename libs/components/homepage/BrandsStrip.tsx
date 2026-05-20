import React from 'react';
import styles from './BrandsStrip.module.scss';

interface Brand {
	emoji: string;
	name: string;
}

const BRANDS: Brand[] = [
	{ emoji: '🐶', name: 'Royal Canin' },
	{ emoji: '🌿', name: 'Orijen' },
	{ emoji: '🏔', name: "Hill's" },
	{ emoji: '🐾', name: 'Purina' },
	{ emoji: '🍖', name: 'Acana' },
	{ emoji: '🦁', name: 'Farmina' },
	{ emoji: '🐱', name: 'Whiskas' },
	{ emoji: '🐟', name: 'Tetra' },
	{ emoji: '🦜', name: 'Versele-Laga' },
	{ emoji: '🌾', name: 'Josera' },
	{ emoji: '🐠', name: 'Sera' },
	{ emoji: '🦮', name: 'Eukanuba' },
];

export default function BrandsStrip() {
	return (
		<section className={styles.strip}>
			<div className={styles.track}>
				{BRANDS.map((brand) => (
					<button key={brand.name} className={styles.pill} type="button">
						<span className={styles.emoji}>{brand.emoji}</span>
						<span className={styles.name}>{brand.name}</span>
					</button>
				))}
			</div>
		</section>
	);
}
