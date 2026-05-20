import React from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import TrendProductCard from './TrendProductCard';
import { useToast } from '../../hooks/useToast';
import { GET_PRODUCTS } from '../../../apollo/user/query';

const MOCK: any[] = [
	{
		_id: 'tr1', productName: 'Acana Grasslands Cat', productBrand: 'Acana',
		productCategory: 'FOOD', productType: 'CAT', productPrice: 58, productSale: false,
		productImages: [], productLikes: 23, productViews: 145, productStock: 14,
		createdAt: new Date(Date.now() - 86_400_000 * 0).toISOString(),
	},
	{
		_id: 'tr2', productName: 'Purina Pro Senior Dog', productBrand: 'Purina',
		productCategory: 'FOOD', productType: 'DOG', productPrice: 38, productSale: true,
		productSalePercent: 15, productImages: [], productLikes: 18, productViews: 98, productStock: 6,
		createdAt: new Date(Date.now() - 86_400_000 * 0).toISOString(),
	},
	{
		_id: 'tr3', productName: 'Kong Wobbler Treat', productBrand: 'Kong',
		productCategory: 'TOY', productType: 'DOG', productPrice: 19, productSale: false,
		productImages: [], productLikes: 31, productViews: 201, productStock: 20,
		createdAt: new Date(Date.now() - 86_400_000 * 1).toISOString(),
	},
	{
		_id: 'tr4', productName: 'Furminator Long Hair', productBrand: 'Furminator',
		productCategory: 'ACCESSORY', productType: 'CAT', productPrice: 35, productSale: true,
		productSalePercent: 20, productImages: [], productLikes: 12, productViews: 87, productStock: 3,
		createdAt: new Date(Date.now() - 86_400_000 * 1).toISOString(),
	},
	{
		_id: 'tr5', productName: 'Pedigree Dentastix', productBrand: 'Pedigree',
		productCategory: 'FOOD', productType: 'DOG', productPrice: 14, productSale: false,
		productImages: [], productLikes: 28, productViews: 167, productStock: 30,
		createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
	},
	{
		_id: 'tr6', productName: 'Vitakraft Parrot Sticks', productBrand: 'Vitakraft',
		productCategory: 'FOOD', productType: 'BIRD', productPrice: 16, productSale: true,
		productSalePercent: 10, productImages: [], productLikes: 9, productViews: 54, productStock: 25,
		createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
	},
	{
		_id: 'tr7', productName: 'Zymox Pet Spray', productBrand: 'Zymox',
		productCategory: 'MEDICINE', productType: 'DOG', productPrice: 22, productSale: false,
		productImages: [], productLikes: 14, productViews: 93, productStock: 0,
		createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
	},
	{
		_id: 'tr8', productName: 'TetraFin Goldfish Flakes', productBrand: 'Tetra',
		productCategory: 'FOOD', productType: 'FISH', productPrice: 9, productSale: false,
		productImages: [], productLikes: 7, productViews: 43, productStock: 40,
		createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
	},
];

const SKELETON_COUNT = 8;

export default function TrendProducts() {
	const { success } = useToast();

	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 8,
				sort: 'createdAt',
				search: { productStatus: 'ACTIVE' },
			},
		},
	});

	const list: any[] = data?.getProducts?.list?.length ? data.getProducts.list : MOCK;

	return (
		<section className="trend-products" aria-label="Trending products">
			<div className="wrap">
				{/* Header */}
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Just in</p>
						<h2 className="section-hd__title">Trending Now</h2>
						<p className="section-hd__sub">Freshest additions to our catalogue</p>
					</div>
					<Link href="/shop?sort=newest" className="section-hd__link">
						See all new →
					</Link>
				</div>

				{/* Loading skeletons */}
				{loading && (
					<div className="products-grid products-grid--4" aria-busy="true" aria-label="Loading products">
						{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
							<div key={i} className="skeleton skeleton--card" aria-hidden="true" />
						))}
					</div>
				)}

				{/* Error state */}
				{!loading && error && (
					<div className="empty">
						<div className="empty__icon">⚠️</div>
						<h3 className="empty__title">Failed to load products</h3>
						<p className="empty__sub">Please try refreshing the page.</p>
					</div>
				)}

				{/* Product grid */}
				{!loading && !error && list.length === 0 && (
					<div className="empty">
						<div className="empty__icon">🐾</div>
						<h3 className="empty__title">No new products yet</h3>
						<p className="empty__sub">Check back soon — new arrivals drop every week.</p>
						<Link href="/shop" className="empty__cta">Browse all products →</Link>
					</div>
				)}

				{!loading && !error && list.length > 0 && (
					<div className="products-grid products-grid--4">
						{list.map((p: any) => (
							<TrendProductCard
								key={p._id}
								product={p}
								onAddCart={() => success(`${p.productName} added to cart!`)}
							/>
						))}
					</div>
				)}

				{/* Footer CTA */}
				{!loading && !error && list.length > 0 && (
					<div className="trend-products__cta">
						<Link href="/shop?sort=newest" className="trend-products__cta-btn">
							View all new arrivals →
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
