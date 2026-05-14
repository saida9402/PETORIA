'use client';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import TopProductCard from './TopProductCard';
import { GET_PRODUCTS } from '../../../apollo/user/query';

const MOCK = [
	{
		_id: 't1',
		productName: 'Orijen Regional Red',
		productCategory: 'FOOD',
		productType: 'DOG',
		productPrice: 68,
		productImages: [],
		productLikes: 276,
		productViews: 2103,
	},
	{
		_id: 't2',
		productName: 'Royal Canin Maxi Adult',
		productCategory: 'FOOD',
		productType: 'DOG',
		productPrice: 95,
		productImages: [],
		productLikes: 341,
		productViews: 2891,
	},
	{
		_id: 't3',
		productName: 'Kong Classic Extreme',
		productCategory: 'TOY',
		productType: 'DOG',
		productPrice: 22,
		productImages: [],
		productLikes: 189,
		productViews: 1234,
	},
	{
		_id: 't4',
		productName: "Hill's Science Diet",
		productCategory: 'FOOD',
		productType: 'CAT',
		productPrice: 42,
		productImages: [],
		productLikes: 198,
		productViews: 1456,
	},
	{
		_id: 't5',
		productName: 'Frontline Plus 3-pack',
		productCategory: 'MEDICINE',
		productType: 'DOG',
		productPrice: 28,
		productImages: [],
		productLikes: 98,
		productViews: 756,
	},
	{
		_id: 't6',
		productName: 'Whiskas Tuna Pouches',
		productCategory: 'FOOD',
		productType: 'CAT',
		productPrice: 28,
		productImages: [],
		productLikes: 156,
		productViews: 987,
	},
];

export default function TopProducts() {
	const { data, loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 6, sort: 'productViews', search: { productStatus: 'ACTIVE' } },
		},
	});

	const list = (data?.getProducts?.list?.length ? data.getProducts.list : MOCK).slice(0, 6);

	return (
		<section className="top-products">
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Most viewed</p>
						<h2 className="section-hd__title">Top Products</h2>
						<p className="section-hd__sub">Ranked by views and community engagement</p>
					</div>
					<Link href="/shop?sort=productViews" className="section-hd__link">
						View all →
					</Link>
				</div>

				{loading ? (
					<div className="top-products__grid">
						{Array(6)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--r16)' }} />
							))}
					</div>
				) : (
					<div className="top-products__grid">
						{list.map((p: any, i: number) => (
							<TopProductCard key={p._id} product={p} rank={i + 1} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
