'use client';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import TrendProductCard from './TrendProductCard';
import { useToast } from '../../hooks/useToast';
import { GET_PRODUCTS } from '../../../apollo/user/query';

const MOCK = [
	{
		_id: 'tr1',
		productName: 'Acana Grasslands Cat',
		productCategory: 'FOOD',
		productType: 'CAT',
		productPrice: 58,
		productImages: [],
		productLikes: 23,
		productViews: 145,
		createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
	},
	{
		_id: 'tr2',
		productName: 'Purina Pro Senior Dog',
		productCategory: 'FOOD',
		productType: 'DOG',
		productPrice: 45,
		productImages: [],
		productLikes: 18,
		productViews: 98,
		createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
	},
	{
		_id: 'tr3',
		productName: 'Kong Wobbler Treat',
		productCategory: 'TOY',
		productType: 'DOG',
		productPrice: 19,
		productImages: [],
		productLikes: 31,
		productViews: 201,
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
	},
	{
		_id: 'tr4',
		productName: 'Furminator Long Hair',
		productCategory: 'ACCESSORY',
		productType: 'CAT',
		productPrice: 35,
		productImages: [],
		productLikes: 12,
		productViews: 87,
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
	},
	{
		_id: 'tr5',
		productName: 'Pedigree Dentastix',
		productCategory: 'FOOD',
		productType: 'DOG',
		productPrice: 14,
		productImages: [],
		productLikes: 28,
		productViews: 167,
		createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
	},
	{
		_id: 'tr6',
		productName: 'Vitakraft Parrot Sticks',
		productCategory: 'FOOD',
		productType: 'BIRD',
		productPrice: 16,
		productImages: [],
		productLikes: 9,
		productViews: 54,
		createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
	},
	{
		_id: 'tr7',
		productName: 'Zymox Pet Spray',
		productCategory: 'MEDICINE',
		productType: 'DOG',
		productPrice: 22,
		productImages: [],
		productLikes: 14,
		productViews: 93,
		createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
	},
	{
		_id: 'tr8',
		productName: 'TetraFin Goldfish Flakes',
		productCategory: 'FOOD',
		productType: 'FISH',
		productPrice: 9,
		productImages: [],
		productLikes: 7,
		productViews: 43,
		createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
	},
];

export default function TrendProducts() {
	const { success } = useToast();

	const { data, loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 8, sort: 'createdAt', search: { productStatus: 'ACTIVE' } },
		},
	});

	const list = data?.getProducts?.list?.length ? data.getProducts.list : MOCK;

	return (
		<section className="trend-products">
			<div className="wrap">
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

				{loading ? (
					<div className="trend-products__grid">
						{Array(8)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--r16)' }} />
							))}
					</div>
				) : (
					<div className="trend-products__grid">
						{list.map((p: any) => (
							<TrendProductCard key={p._id} product={p} onAddCart={() => success(`${p.productName} added to cart!`)} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
