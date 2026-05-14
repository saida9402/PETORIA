'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

const ITEMS = [
	{
		id: 'n1',
		name: 'Acana Grasslands Cat',
		brand: 'Acana',
		price: 58,
		icon: '🌿',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 23,
		views: 145,
	},
	{
		id: 'n2',
		name: 'Purina Pro Senior Dog',
		brand: 'Purina',
		price: 45,
		icon: '🦴',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 18,
		views: 98,
	},
	{
		id: 'n3',
		name: 'Kong Wobbler Treat',
		brand: 'Kong',
		price: 19,
		icon: '🎾',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 31,
		views: 201,
	},
	{
		id: 'n4',
		name: 'Furminator Long Hair',
		brand: 'Furminator',
		price: 35,
		icon: '✂️',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 12,
		views: 87,
	},
	{
		id: 'n5',
		name: 'Pedigree Dentastix',
		brand: 'Pedigree',
		price: 14,
		icon: '🦷',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 28,
		views: 167,
	},
	{
		id: 'n6',
		name: 'Zymox Pet Spray',
		brand: 'Zymox',
		price: 22,
		icon: '💧',
		badge: 'New',
		badgeClass: 'badge--new',
		likes: 9,
		views: 54,
	},
];

export default function NewArrivals() {
	const [added, setAdded] = useState<Set<string>>(new Set());
	const addCart = (id: string) => {
		setAdded((p) => {
			const n = new Set(p);
			n.add(id);
			return n;
		});
		setTimeout(
			() =>
				setAdded((p) => {
					const n = new Set(p);
					n.delete(id);
					return n;
				}),
			1200,
		);
	};
	return (
		<section
			className="new-arrivals"
			style={{
				background: 'var(--card)',
				borderTop: '1px solid var(--border2)',
				borderBottom: '1px solid var(--border2)',
			}}
		>
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Just arrived</p>
						<h2 className="section-hd__title">New Arrivals</h2>
					</div>
					<Link href="/shop?sort=newest" className="section-hd__link">
						See all new →
					</Link>
				</div>
				<div className="new-arrivals__carousel">
					{ITEMS.map((p) => (
						<div key={p.id} className="new-arrivals__item">
							<ProductCard product={p} added={added.has(p.id)} onAdd={() => addCart(p.id)} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
