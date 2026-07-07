import React from 'react';
import styles from './BrandsStrip.module.scss';

const BRANDS = [
	'Royal Canin',
	'Orijen',
	"Hill's",
	'Purina',
	'Acana',
	'Farmina',
	'Whiskas',
	'Tetra',
	'Versele-Laga',
	'Josera',
	'Sera',
	'Eukanuba',
];

export default function BrandsStrip() {
	return (
		<section className={styles.strip}>
			<div className={styles.track}>
				{BRANDS.map((brand) => (
					<button key={brand} className={styles.card} type="button">
						<span className={styles.avatar}>{brand[0].toUpperCase()}</span>
						<span className={styles.name}>{brand}</span>
					</button>
				))}
			</div>
		</section>
	);
}
