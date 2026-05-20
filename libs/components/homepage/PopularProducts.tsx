import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import PopularProductCard from './PopularProductCard';
import { useToast } from '../../hooks/useToast';
import { GET_PRODUCTS } from '../../../apollo/user/query';

const TYPE_CFG: Record<string, { icon: string; label: string; color: string }> = {
	DOG: { icon: '🐶', label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: '🐱', label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: '🐦', label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: '🐟', label: 'Fish', color: 'var(--teal)' },
	OTHER: { icon: '🐾', label: 'Other', color: 'var(--g700)' },
};

const TYPE_TABS = [
	{ key: 'ALL', icon: '🐾', label: 'All' },
	{ key: 'DOG', icon: '🐶', label: 'Dogs' },
	{ key: 'CAT', icon: '🐱', label: 'Cats' },
	{ key: 'BIRD', icon: '🐦', label: 'Birds' },
	{ key: 'FISH', icon: '🐠', label: 'Fish' },
];

export default function PopularProducts() {
	const [activeType, setActiveType] = useState('ALL');
	const { success } = useToast();

	const { data, loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 8,
				sort: 'productLikes',
				search: {
					...(activeType !== 'ALL' ? { typeList: [activeType] } : {}),
					productStatus: 'ACTIVE',
				},
			},
		},
	});

	const products = data?.getProducts?.list ?? [];

	const MOCK_PRODUCTS = [
		{
			_id: 'mp1',
			productName: 'Royal Canin Maxi Adult',
			productCategory: 'FOOD',
			productType: 'DOG',
			productPrice: 95,
			productImages: [],
			productLikes: 341,
			productViews: 2891,
			productStock: 12,
		},
		{
			_id: 'mp2',
			productName: "Hill's Science Diet",
			productCategory: 'FOOD',
			productType: 'CAT',
			productPrice: 42,
			productImages: [],
			productLikes: 198,
			productViews: 1456,
			productStock: 8,
		},
		{
			_id: 'mp3',
			productName: 'Kong Classic Extreme',
			productCategory: 'TOY',
			productType: 'DOG',
			productPrice: 22,
			productImages: [],
			productLikes: 189,
			productViews: 1234,
			productStock: 20,
		},
		{
			_id: 'mp4',
			productName: 'Frontline Plus 3-pack',
			productCategory: 'MEDICINE',
			productType: 'DOG',
			productPrice: 28,
			productImages: [],
			productLikes: 98,
			productViews: 756,
			productStock: 15,
		},
		{
			_id: 'mp5',
			productName: 'Orijen Regional Red',
			productCategory: 'FOOD',
			productType: 'DOG',
			productPrice: 68,
			productImages: [],
			productLikes: 276,
			productViews: 2103,
			productStock: 5,
		},
		{
			_id: 'mp6',
			productName: 'Whiskas Tuna Selection',
			productCategory: 'FOOD',
			productType: 'CAT',
			productPrice: 28,
			productImages: [],
			productLikes: 156,
			productViews: 987,
			productStock: 30,
		},
		{
			_id: 'mp7',
			productName: 'Vitakraft Parrot Sticks',
			productCategory: 'FOOD',
			productType: 'BIRD',
			productPrice: 16,
			productImages: [],
			productLikes: 45,
			productViews: 321,
			productStock: 25,
		},
		{
			_id: 'mp8',
			productName: 'TetraFin Goldfish',
			productCategory: 'FOOD',
			productType: 'FISH',
			productPrice: 9,
			productImages: [],
			productLikes: 34,
			productViews: 267,
			productStock: 40,
		},
	];

	const displayList = (products.length > 0 ? products : MOCK_PRODUCTS).filter(
		(p: any) => activeType === 'ALL' || p.productType === activeType,
	);

	return (
		<section className="popular-products">
			<div className="wrap">
				{/* Header */}
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Most loved</p>
						<h2 className="section-hd__title">Popular Products</h2>
						<p className="section-hd__sub">Handpicked by our community of 12,000+ pet owners</p>
					</div>
					<Link href="/shop" className="section-hd__link">
						View all →
					</Link>
				</div>

				{/* Type tabs */}
				<div className="popular-products__tabs">
					{TYPE_TABS.map((t) => (
						<button
							key={t.key}
							onClick={() => setActiveType(t.key)}
							className={`popular-products__tab${activeType === t.key ? ' popular-products__tab--active' : ''}`}
						>
							<span>{t.icon}</span> {t.label}
						</button>
					))}
				</div>

				{/* Grid */}
				{loading ? (
					<div className="products-grid products-grid--4">
						{Array(8)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 340, borderRadius: 'var(--r20)' }} />
							))}
					</div>
				) : displayList.length === 0 ? (
					<div className="empty">
						<div className="empty__icon">{TYPE_CFG[activeType]?.icon ?? '🐾'}</div>
						<div className="empty__title">No {TYPE_CFG[activeType]?.label ?? ''} products found</div>
					</div>
				) : (
					<div className="products-grid products-grid--4">
						{displayList.map((p: any) => (
							<PopularProductCard
								key={p._id}
								product={p}
								onAddCart={() => success(`${p.productName} added to cart!`)}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
