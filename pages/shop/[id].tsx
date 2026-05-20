import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';

import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_PRODUCT } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { API_URL, TYPE_CFG, CAT_CFG } from '../../libs/config';
import { T } from '../../libs/types/common';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { id } = router.query;

	const [liked, setLiked] = useState(false);
	const [likes, setLikes] = useState(0);
	const [qty, setQty] = useState(1);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { data, loading } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId: id },
		skip: !id,
		onCompleted: (d: T) => {
			const p = d?.getProduct;
			if (p) {
				setLiked(p.meLiked?.[0]?.myFavorite ?? false);
				setLikes(p.productLikes ?? 0);
			}
		},
	});

	const product = data?.getProduct;

	const handleLike = async () => {
		if (!product?._id) return;
		try {
			await likeTargetProduct({ variables: { input: product._id } });
			setLiked((v) => !v);
			setLikes((v) => (liked ? v - 1 : v + 1));
		} catch {}
	};

	if (loading) {
		return (
			<div className="product-detail-page">
				<div className="wrap">
					<div className="product-detail__loading">
						<div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="product-detail-page">
				<div className="wrap">
					<div className="product-detail__empty">
						<p className="product-detail__empty-icon">🐾</p>
						<h2>Product not found</h2>
						<p>This product may have been removed or is no longer available.</p>
						<Link href="/shop" className="btn btn--primary">
							Back to shop
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const imgSrc = product.productImages?.[0]
		? `${API_URL}/uploads/${product.productImages[0]}`
		: null;

	const typeCfg = TYPE_CFG[product.productType] ?? { icon: '🐾', label: product.productType, color: 'var(--np)' };
	const catCfg  = CAT_CFG[product.productCategory] ?? { icon: '🦴', label: product.productCategory };
	const isSold  = product.productStatus === 'SOLD';
	const isOutOfStock = !isSold && (product.productStock ?? 0) === 0;
	const isLowStock   = !isSold && !isOutOfStock && (product.productStock ?? 0) <= 5;

	const oldPrice =
		product.productSale && product.productSalePercent
			? Math.round(product.productPrice / (1 - product.productSalePercent / 100))
			: null;

	if (device === 'mobile') {
		return (
			<div className="product-detail-page product-detail-page--mobile">
				<div className="wrap">
					<Link href="/shop" className="product-detail__back">← Back to shop</Link>
					<div className="product-detail__img-wrap">
						{imgSrc
							? <img src={imgSrc} alt={product.productName} className="product-detail__img" />
							: <div className="product-detail__placeholder">{catCfg.icon}</div>}
					</div>
					<div className="product-detail__body">
						<h1 className="product-detail__name">{product.productName}</h1>
						<p className="product-detail__price">${product.productPrice.toLocaleString()}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="product-detail-page">
			<div className="wrap">
				{/* Breadcrumb */}
				<nav className="product-detail__breadcrumb">
					<Link href="/">Home</Link>
					<span>›</span>
					<Link href="/shop">Shop</Link>
					<span>›</span>
					<span>{product.productName}</span>
				</nav>

				<div className="product-detail__layout">
					{/* Images */}
					<div className="product-detail__gallery">
						<div className="product-detail__main-img">
							{imgSrc ? (
								<img src={imgSrc} alt={product.productName} />
							) : (
								<div className="product-detail__img-placeholder">
									<span>{catCfg.icon}</span>
								</div>
							)}
							{(isSold || isOutOfStock) && (
								<div className="product-detail__unavailable-badge">
									{isSold ? 'SOLD OUT' : 'OUT OF STOCK'}
								</div>
							)}
						</div>
					</div>

					{/* Info */}
					<div className="product-detail__info">
						{product.productBrand && (
							<p className="product-detail__brand">{product.productBrand}</p>
						)}

						<div className="product-detail__tags">
							<span className="product-detail__type" style={{ color: typeCfg.color }}>
								{typeCfg.icon} {typeCfg.label}
							</span>
							<span className="product-detail__cat">{catCfg.icon} {catCfg.label}</span>
						</div>

						<h1 className="product-detail__name">{product.productName}</h1>

						<div className="product-detail__price-row">
							<strong className="product-detail__price">
								${product.productPrice.toLocaleString()}
							</strong>
							{oldPrice && (
								<s className="product-detail__old-price">${oldPrice.toLocaleString()}</s>
							)}
							{product.productSalePercent && (
								<span className="badge badge--sale">-{product.productSalePercent}%</span>
							)}
						</div>

						{isLowStock && (
							<p className="product-detail__low-stock">⚠ Only {product.productStock} left!</p>
						)}

						<div className="product-detail__stats">
							<span>❤️ {likes} likes</span>
							<span>👁 {product.productViews} views</span>
						</div>

						{!isSold && !isOutOfStock && (
							<div className="product-detail__qty">
								<button className="product-detail__qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
								<span className="product-detail__qty-val">{qty}</span>
								<button className="product-detail__qty-btn" onClick={() => setQty(qty + 1)}>+</button>
							</div>
						)}

						<div className="product-detail__actions">
							{!isSold && !isOutOfStock ? (
								<button className="btn btn--primary btn--lg product-detail__cart-btn">
									🛒 Add to cart
								</button>
							) : (
								<button className="btn btn--primary btn--lg" disabled style={{ opacity: 0.5 }}>
									{isSold ? 'Sold Out' : 'Out of Stock'}
								</button>
							)}
							<button
								className={`product-detail__like-btn${liked ? ' product-detail__like-btn--on' : ''}`}
								onClick={handleLike}
								aria-label="Add to wishlist"
							>
								{liked ? '❤️' : '🤍'}
							</button>
						</div>

						<div className="product-detail__delivery">
							🚚 Free delivery on orders over $50
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductDetail);
