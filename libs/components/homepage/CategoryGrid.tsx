import Link from 'next/link';

const CATS = [
	{ icon: '🐶', label: 'Dogs',        href: '/shop?type=DOG' },
	{ icon: '🐱', label: 'Cats',        href: '/shop?type=CAT' },
	{ icon: '🐦', label: 'Birds',       href: '/shop?type=BIRD' },
	{ icon: '🐠', label: 'Fish',        href: '/shop?type=FISH' },
	{ icon: '🍖', label: 'Food',        href: '/shop?cat=FOOD' },
	{ icon: '💊', label: 'Medicine',    href: '/shop?cat=MEDICINE' },
	{ icon: '🎾', label: 'Toys',        href: '/shop?cat=TOY' },
	{ icon: '🎀', label: 'Accessories', href: '/shop?cat=ACCESSORY' },
];

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
				<div className="cats__grid">
					{CATS.map((c) => (
						<Link key={c.label} href={c.href} className="cats__item">
							<span className="cats__item-icon">{c.icon}</span>
							<span className="cats__item-name">{c.label}</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
