import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { API_URL, TYPE_CFG, CAT_CFG } from '../../config';

interface Product {
	_id: string;
	productName: string;
	productCategory: string;
	productType: string;
	productPrice: number;
	productImages?: string[];
	productLikes: number;
	productViews: number;
	productStock?: number;
	productBrand?: string;
	productSale?: boolean;
	productSalePercent?: number;
	meLiked?: { myFavorite: boolean }[];
}

const MOCK: Product[] = [
	{
		_id: 'na1',
		productName: 'Acana Grasslands Cat',
		productBrand: 'Acana',
		productCategory: 'FOOD',
		productType: 'CAT',
		productPrice: 58,
		productImages: [],
		productLikes: 23,
		productViews: 145,
		productStock: 10,
	},
	{
		_id: 'na2',
		productName: 'Purina Pro Senior Dog',
		productBrand: 'Purina',
		productCategory: 'FOOD',
		productType: 'DOG',
		productPrice: 45,
		productImages: [],
		productLikes: 18,
		productViews: 98,
		productStock: 8,
	},
	{
		_id: 'na3',
		productName: 'Kong Wobbler Treat',
		productBrand: 'Kong',
		productCategory: 'TOY',
		productType: 'DOG',
		productPrice: 19,
		productImages: [],
		productLikes: 31,
		productViews: 201,
		productStock: 15,
	},
	{
		_id: 'na4',
		productName: 'Furminator Long Hair Cat',
		productBrand: 'Furminator',
		productCategory: 'ACCESSORY',
		productType: 'CAT',
		productPrice: 35,
		productImages: [],
		productLikes: 12,
		productViews: 87,
		productStock: 5,
	},
];

function ArrivalCard({ product: p }: { product: Product }) {
	const router = useRouter();
	const [liked, setLiked] = useState(p.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(p.productLikes);
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const imgSrc = p.productImages?.[0] ? `${API_URL}/uploads/${p.productImages[0]}` : null;
	const catCfg = CAT_CFG[p.productCategory] ?? { icon: '🦴', label: p.productCategory };
	const typeCfg = TYPE_CFG[p.productType] ?? { icon: '🐾', label: p.productType, color: 'var(--np)' };
	const isLowStock = typeof p.productStock === 'number' && p.productStock > 0 && p.productStock <= 5;
	const oldPrice =
		p.productSale && p.productSalePercent
			? Math.round(p.productPrice / (1 - p.productSalePercent / 100))
			: null;

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeProduct({ variables: { input: p._id } });
			setLiked((v) => !v);
			setLikes((v) => (liked ? v - 1 : v + 1));
		} catch {}
	};

	return (
		<article className="arrival-card" onClick={() => router.push(`/shop/${p._id}`)}>
			<div className="arrival-card__img-wrap">
				{imgSrc ? (
					<img src={imgSrc} alt={p.productName} className="arrival-card__img" loading="lazy" />
				) : (
					<div className="arrival-card__placeholder">
						<span>{catCfg.icon}</span>
					</div>
				)}
				<span className="badge badge--new arrival-card__badge">NEW</span>
				{p.productSale && p.productSalePercent && (
					<span className="badge badge--sale arrival-card__badge-sale">-{p.productSalePercent}%</span>
				)}
				<button
					className={`arrival-card__fav${liked ? ' arrival-card__fav--on' : ''}`}
					onClick={handleLike}
					aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
				>
					{liked ? '❤️' : '🤍'}
				</button>
			</div>
			<div className="arrival-card__body">
				<div className="arrival-card__meta">
					<span className="arrival-card__type" style={{ color: typeCfg.color }}>
						{typeCfg.icon} {typeCfg.label}
					</span>
					<span className="arrival-card__cat">{catCfg.icon} {catCfg.label}</span>
				</div>
				{p.productBrand && <p className="arrival-card__brand">{p.productBrand}</p>}
				<h3 className="arrival-card__name">{p.productName}</h3>
				<div className="arrival-card__price-row">
					<strong className="arrival-card__price">${p.productPrice.toLocaleString()}</strong>
					{oldPrice && <s className="arrival-card__old-price">${oldPrice.toLocaleString()}</s>}
				</div>
				{isLowStock && (
					<p className="arrival-card__low-stock">⚠ Only {p.productStock} left!</p>
				)}
				<div className="arrival-card__stats">
					<span>❤️ {likes}</span>
					<span>👁 {p.productViews}</span>
				</div>
			</div>
		</article>
	);
}

export default function NewArrivals() {
	const { data, loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				search: { productStatus: 'ACTIVE' },
			},
		},
	});

	const list: Product[] = data?.getProducts?.list?.length ? data.getProducts.list : MOCK;

	return (
		<section className="new-arrivals">
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Just arrived</p>
						<h2 className="section-hd__title">New Arrivals</h2>
						<p className="section-hd__sub">Fresh picks added to our catalogue this week</p>
					</div>
					<Link href="/shop?sort=newest" className="section-hd__link">
						See all new →
					</Link>
				</div>

				{loading ? (
					<div className="new-arrivals__grid">
						{Array(4).fill(0).map((_, i) => (
							<div key={i} className="skeleton skeleton--card" />
						))}
					</div>
				) : (
					<div className="new-arrivals__grid">
						{list.slice(0, 4).map((p) => (
							<ArrivalCard key={p._id} product={p} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
