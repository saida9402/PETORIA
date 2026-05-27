import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { API_URL, TYPE_CFG, CAT_CFG } from '../../config';
import { addToCart } from '../../cart';

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
	productStatus?: string;
	productSale?: boolean;
	productSalePercent?: number;
	productBrand?: string;
	createdAt: string;
	meLiked?: { myFavorite: boolean }[];
}

interface Props {
	product: Product;
	onAddCart?: (product: Product) => void;
}

function deriveRating(likes: number, views: number): number {
	if (views === 0) return 4.0;
	const ratio = likes / views;
	return parseFloat(Math.min(5.0, Math.max(3.5, 3.5 + ratio * 6)).toFixed(1));
}

function Stars({ rating }: { rating: number }) {
	const full = Math.floor(rating);
	const half = rating - full >= 0.4;
	const empty = 5 - full - (half ? 1 : 0);
	return (
		<span className="tpc__stars" aria-label={`Rating ${rating}`}>
			<span className="tpc__stars-filled">
				{'★'.repeat(full)}
				{half ? '½' : ''}
			</span>
			<span className="tpc__stars-empty">{'☆'.repeat(empty)}</span>
			<em className="tpc__stars-score">{rating}</em>
		</span>
	);
}

export default function TrendProductCard({ product: p, onAddCart }: Props) {
	const router = useRouter();
	const [liked, setLiked] = useState(p.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(p.productLikes);
	const [added, setAdded] = useState(false);
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const imgSrc = p.productImages?.[0] ? `${API_URL}/${p.productImages[0]}` : null;
	const catCfg = CAT_CFG[p.productCategory] ?? { icon: '🦴', label: p.productCategory };
	const typeCfg = TYPE_CFG[p.productType] ?? { icon: '🐾', label: p.productType, color: '#4e8a28' };

	const isSold = p.productStatus === 'SOLD';
	const isOutOfStock = !isSold && typeof p.productStock === 'number' && p.productStock === 0;
	const isLowStock = !isSold && !isOutOfStock && typeof p.productStock === 'number' && p.productStock <= 5;

	const oldPrice =
		p.productSale && p.productSalePercent ? Math.round(p.productPrice / (1 - p.productSalePercent / 100)) : null;

	const rating = deriveRating(p.productLikes, p.productViews);

	const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86_400_000);
	const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeProduct({ variables: { input: p._id } });
			setLiked((v) => !v);
			setLikes((v) => (liked ? v - 1 : v + 1));
		} catch {}
	};

	const handleCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isSold || isOutOfStock) return;

		addToCart({
			productId: p._id,
			productName: p.productName,
			productBrand: p.productBrand ?? '',
			productImage: p.productImages?.[0] ?? '',
			productPrice: p.productPrice,
			productType: p.productType,
		});

		onAddCart?.(p);
		setAdded(true);
		setTimeout(() => setAdded(false), 1400);
	};

	const navigate = () => router.push(`/shop/${p._id}`);

	return (
		<article
			className={`tpc${isSold || isOutOfStock ? ' tpc--unavailable' : ''}`}
			onClick={navigate}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && navigate()}
			aria-label={p.productName}
		>
			{/* ── Image ── */}
			<div className="tpc__img-wrap">
				{imgSrc ? (
					<img src={imgSrc} alt={p.productName} className="tpc__img" loading="lazy" draggable={false} />
				) : (
					<div className="tpc__placeholder" aria-hidden="true">
						<span>{catCfg.icon}</span>
					</div>
				)}

				{/* Badges */}
				<div className="tpc__badges" aria-hidden="true">
					<span className="badge badge--new">NEW</span>
					{p.productSale && p.productSalePercent && <span className="badge badge--sale">-{p.productSalePercent}%</span>}
				</div>

				{/* Wishlist */}
				<button
					type="button"
					className={`tpc__fav${liked ? ' tpc__fav--on' : ''}`}
					onClick={handleLike}
					aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
				>
					{liked ? '❤️' : '🤍'}
				</button>

				{/* Quick add */}
				{!isSold && !isOutOfStock && (
					<button
						type="button"
						className={`tpc__quick-add${added ? ' tpc__quick-add--done' : ''}`}
						onClick={handleCart}
						aria-label="Add to cart"
					>
						{added ? '✓ Added' : '+ Cart'}
					</button>
				)}

				{/* Unavailable overlay */}
				{(isSold || isOutOfStock) && (
					<div className="tpc__overlay" aria-label="Product unavailable">
						{isSold ? 'SOLD OUT' : 'OUT OF STOCK'}
					</div>
				)}
			</div>

			{/* ── Body ── */}
			<div className="tpc__body">
				<div className="tpc__meta-row">
					<span className="tpc__type-tag" style={{ color: typeCfg.color }}>
						{typeCfg.icon} {typeCfg.label}
					</span>
					<time className="tpc__time" dateTime={p.createdAt}>
						{timeLabel}
					</time>
				</div>

				<p className="tpc__category">
					{catCfg.icon} {catCfg.label}
				</p>

				<h3 className="tpc__name">{p.productName}</h3>

				{p.productBrand && <p className="tpc__brand">{p.productBrand}</p>}

				<div className="tpc__rating">
					<Stars rating={rating} />
					<span className="tpc__rating-count">({likes})</span>
				</div>

				<div className="tpc__price-row">
					<strong className="tpc__price">${p.productPrice.toLocaleString()}</strong>
					{oldPrice && <s className="tpc__old-price">${oldPrice.toLocaleString()}</s>}
				</div>

				{isLowStock && (
					<p className="tpc__low-stock" role="alert">
						⚠ Only {p.productStock} left!
					</p>
				)}

				<div className="tpc__views-row" aria-hidden="true">
					<span>❤️ {likes}</span>
					<span>👁 {p.productViews}</span>
				</div>
			</div>
		</article>
	);
}
