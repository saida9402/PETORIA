import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
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
import { addToCart } from '../../libs/cart';
import { sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const isValidObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v);

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const productId = typeof router.query.id === 'string' ? router.query.id : '';
	const validId = isValidObjectId(productId);

	const [liked, setLiked] = useState(false);
	const [likes, setLikes] = useState(0);
	const [qty, setQty] = useState(1);
	const [activeImg, setActiveImg] = useState(0);
	const [mainImgFailed, setMainImgFailed] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const [touchStartX, setTouchStartX] = useState<number | null>(null);

	useEffect(() => {
		setMainImgFailed(false);
	}, [activeImg]);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { data, loading } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId },
		skip: !validId,
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
		} catch (err) {
			console.error(err);
		}
	};

	const handleAddToCart = () => {
		if (!product?._id) return;
		addToCart(
			{
				productId: product._id,
				productName: product.productName,
				productBrand: product.productBrand ?? '',
				productImage: product.productImages?.[0] ?? '',
				productPrice: product.productPrice,
				productType: product.productType,
			},
			qty,
		);
		sweetTopSmallSuccessAlert(`Added to cart (${qty})`, 900);
	};

	if (!validId) {
		return (
			<div className="product-detail-page">
				<section className="product-detail-container">
					<div className="product-detail__empty">
						<p className="product-detail__empty-icon">🐾</p>
						<h2>Product not found</h2>
						<p>This product may have been removed or is no longer available.</p>
						<Link href="/shop" className="btn btn--primary">
							Back to shop
						</Link>
					</div>
				</section>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="product-detail-page">
				<section className="product-detail-container">
					<div className="product-detail__loading">
						<div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
					</div>
				</section>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="product-detail-page">
				<section className="product-detail-container">
					<div className="product-detail__empty">
						<p className="product-detail__empty-icon">🐾</p>
						<h2>Product not found</h2>
						<p>This product may have been removed or is no longer available.</p>
						<Link href="/shop" className="btn btn--primary">
							Back to shop
						</Link>
					</div>
				</section>
			</div>
		);
	}

	const images: string[] = product.productImages ?? [];
	const mainImg = images[activeImg]
		? images[activeImg].startsWith('http')
			? images[activeImg]
			: `${API_URL}/${images[activeImg]}`
		: null;

	const typeCfg = TYPE_CFG[product.productType] ?? { icon: '🐾', label: product.productType, color: 'var(--np)' };
	const catCfg = CAT_CFG[product.productCategory] ?? { icon: '🦴', label: product.productCategory };
	const isSold = product.productStatus === 'SOLD';
	const isOutOfStock = !isSold && (product.productStock ?? 0) === 0;
	const isLowStock = !isSold && !isOutOfStock && (product.productStock ?? 0) <= 5;

	const oldPrice =
		product.productSale && product.productSalePercent
			? Math.round(product.productPrice / (1 - product.productSalePercent / 100))
			: null;

	const seller = product.memberData;
	const sellerAvatar = seller?.memberImage
		? seller.memberImage.startsWith('http')
			? seller.memberImage
			: `${API_URL}/${seller.memberImage}`
		: '/img/profile/defaultUser.svg';

	const canPurchase = !isSold && !isOutOfStock;
	const incQty = () => setQty((q) => (product.productStock ? Math.min(product.productStock, q + 1) : q + 1));
	const decQty = () => setQty((q) => Math.max(1, q - 1));

	const ogTitle = product.productName ? `${product.productName} | Petoria` : 'Product | Petoria';
	const ogDesc =
		product.productDesc ??
		`Buy ${product.productName} at Petoria — premium pet products for your beloved pets.`;
	const ogImage = product.productImages?.[0]
		? product.productImages[0].startsWith('http')
			? product.productImages[0]
			: `${API_URL}/${product.productImages[0]}`
		: undefined;

	const productHead = (
		<Head>
			<title>{ogTitle}</title>
			<meta name="description" content={ogDesc.slice(0, 160)} />
			<meta property="og:title" content={ogTitle} />
			<meta property="og:description" content={ogDesc.slice(0, 200)} />
			<meta property="og:type" content="product" />
			{ogImage && <meta property="og:image" content={ogImage} />}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={ogTitle} />
			<meta name="twitter:description" content={ogDesc.slice(0, 200)} />
			{ogImage && <meta name="twitter:image" content={ogImage} />}
		</Head>
	);

	if (device === 'mobile') {
		return (
			<div className="product-detail-page product-detail-page--mobile">
				{productHead}
				<div className="wrap">
					<Link href="/shop" className="product-detail__back">← Back to shop</Link>
					<div
						className="product-detail__main-img"
						onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
						onTouchEnd={(e) => {
							if (touchStartX === null || images.length <= 1) return;
							const delta = touchStartX - e.changedTouches[0].clientX;
							if (Math.abs(delta) >= 50) {
								setActiveImg((i) => Math.min(Math.max(i + (delta > 0 ? 1 : -1), 0), images.length - 1));
							}
							setTouchStartX(null);
						}}
					>
						{mainImg && !mainImgFailed
							? <img src={mainImg} alt={product.productName} onError={() => setMainImgFailed(true)} />
							: <div className="product-detail__img-placeholder"><span>{catCfg.icon}</span></div>}
						{(isSold || isOutOfStock) && (
							<div className="product-detail__unavailable-badge">
								{isSold ? 'SOLD OUT' : 'OUT OF STOCK'}
							</div>
						)}
					</div>
					{images.length > 1 && (
						<>
							<div className="product-detail__thumbs">
								{images.slice(0, 5).map((img, i) => (
									<button
										key={img + i}
										type="button"
										className={`product-detail__thumb${i === activeImg ? ' product-detail__thumb--active' : ''}`}
										onClick={() => setActiveImg(i)}
										aria-label={`View image ${i + 1}`}
									>
										<img
											src={img.startsWith('http') ? img : `${API_URL}/${img}`}
											alt=""
											onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
										/>
									</button>
								))}
							</div>
							<span className="product-detail__sr-only" aria-live="polite" aria-atomic="true">
								{`Showing image ${activeImg + 1} of ${images.length}`}
							</span>
						</>
					)}
					<div className="product-detail__body">
						{product.productBrand && (
							<p className="product-detail__brand">{product.productBrand}</p>
						)}
						<div className="product-detail__tags">
							<span className="product-detail__type-pill">{typeCfg.icon} {typeCfg.label}</span>
							<span className="product-detail__cat-pill">{catCfg.icon} {catCfg.label}</span>
						</div>
						<h1 className="product-detail__name">{product.productName}</h1>
						<div className="product-detail__price-row">
							<strong className="product-detail__price">${product.productPrice.toLocaleString()}</strong>
							{oldPrice && <s className="product-detail__old-price">${oldPrice.toLocaleString()}</s>}
							{product.productSalePercent && (
								<span className="badge badge--sale">-{product.productSalePercent}%</span>
							)}
						</div>
						<div className="product-detail__stats">
							<span>❤️ {likes} likes</span>
							<span>👁 {product.productViews} views</span>
						</div>
						{likes > 0 && (
							<p className="product-detail__social-proof">Liked by {likes} users</p>
						)}
						{isLowStock && (
							<p className="product-detail__low-stock">⚠ Only {product.productStock} left!</p>
						)}
						{seller && (
							<Link href={`/seller/${seller._id}`} className="product-detail__seller-card">
								<img
									src={sellerAvatar}
									alt={seller.memberNick}
									className="product-detail__seller-avatar"
									onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
								/>
								<div className="product-detail__seller-info">
									<p className="product-detail__seller-name">
										{seller.memberNick}
										{seller.memberType === 'SELLER' && (
											<span className="product-detail__seller-badge" aria-label="Verified seller">✓</span>
										)}
									</p>
									<p className="product-detail__seller-link">View store →</p>
								</div>
							</Link>
						)}
						<div className="product-detail__delivery">
							🚚 Free delivery on orders over $50
						</div>
						{product.productDesc && (
							<>
								<p className={`product-detail__desc${product.productDesc.length > 200 && !descExpanded ? ' product-detail__desc--clamped' : ''}`}>
									{product.productDesc}
								</p>
								{product.productDesc.length > 200 && (
									<button
										type="button"
										className="product-detail__desc-toggle"
										onClick={() => setDescExpanded((v) => !v)}
									>
										{descExpanded ? 'Show less ▴' : 'Read more ▾'}
									</button>
								)}
							</>
						)}
						<div className="product-detail__specs">
							<p className="product-detail__section-title">Product Details</p>
							{product.productBrand && (
								<div className="product-detail__spec-row">
									<span className="product-detail__spec-label">Brand</span>
									<span className="product-detail__spec-value">{product.productBrand}</span>
								</div>
							)}
							<div className="product-detail__spec-row">
								<span className="product-detail__spec-label">Pet Type</span>
								<span className="product-detail__spec-value">{typeCfg.icon} {typeCfg.label}</span>
							</div>
							<div className="product-detail__spec-row">
								<span className="product-detail__spec-label">Category</span>
								<span className="product-detail__spec-value">{catCfg.icon} {catCfg.label}</span>
							</div>
							<div className="product-detail__spec-row">
								<span className="product-detail__spec-label">Price</span>
								<span className="product-detail__spec-value">${product.productPrice.toLocaleString()}</span>
							</div>
							{product.productStock !== undefined && (
								<div className="product-detail__spec-row">
									<span className="product-detail__spec-label">Stock</span>
									<span className="product-detail__spec-value">
										{product.productStock > 0 ? `${product.productStock} in stock` : 'Out of stock'}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
				{canPurchase ? (
					<div className="product-detail__mobile-bar">
						<div className="product-detail__qty product-detail__qty--compact">
							<button className="product-detail__qty-btn" onClick={decQty} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
							<span className="product-detail__qty-val">{qty}</span>
							<button className="product-detail__qty-btn" onClick={incQty} aria-label="Increase quantity">+</button>
						</div>
						<button
							type="button"
							className={`product-detail__like-btn${liked ? ' product-detail__like-btn--on' : ''}`}
							onClick={handleLike}
							aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
						>
							{liked ? '❤️' : '🤍'}
						</button>
						<button type="button" className="btn btn--primary btn--lg product-detail__cart-btn" onClick={handleAddToCart}>
							🛒 Add to cart
						</button>
					</div>
				) : (
					<div className="product-detail__mobile-bar product-detail__mobile-bar--unavailable">
						<button
							type="button"
							className={`product-detail__like-btn${liked ? ' product-detail__like-btn--on' : ''}`}
							onClick={handleLike}
							aria-label={liked ? 'Remove from wishlist' : 'Save for later'}
						>
							{liked ? '❤️' : '🤍'}
						</button>
						<p className="product-detail__unavailable-msg">
							{isSold ? '❌ Sold Out' : '❌ Out of Stock'}
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="product-detail-page">
			{productHead}
			<section className="product-detail-container">
				{/* Breadcrumb */}
				<nav className="product-detail__breadcrumb">
					<Link href="/">Home</Link>
					<span aria-hidden>›</span>
					<Link href="/shop">Shop</Link>
					<span aria-hidden>›</span>
					<span className="product-detail__breadcrumb-current">{product.productName}</span>
				</nav>

				<div className="product-detail__layout">
					{/* Gallery */}
					<div className="product-detail__gallery">
						<div className="product-detail__main-img">
							{mainImg && !mainImgFailed ? (
								<img src={mainImg} alt={product.productName} onError={() => setMainImgFailed(true)} />
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
							{product.productSalePercent ? (
								<span className="product-detail__sale-pill">-{product.productSalePercent}%</span>
							) : null}
						</div>

						{images.length > 1 && (
							<div className="product-detail__thumbs">
								{images.slice(0, 5).map((img, i) => (
									<button
										key={img + i}
										type="button"
										className={`product-detail__thumb${i === activeImg ? ' product-detail__thumb--active' : ''}`}
										onClick={() => setActiveImg(i)}
										aria-label={`View image ${i + 1}`}
									>
										<img
											src={img.startsWith('http') ? img : `${API_URL}/${img}`}
											alt=""
											onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Info */}
					<div className="product-detail__info">
						{product.productBrand && (
							<p className="product-detail__brand">{product.productBrand}</p>
						)}

						<div className="product-detail__tags">
							<span className="product-detail__type-pill">
								{typeCfg.icon} {typeCfg.label}
							</span>
							<span className="product-detail__cat-pill">
								{catCfg.icon} {catCfg.label}
							</span>
						</div>

						<h1 className="product-detail__name">{product.productName}</h1>

						<div className="product-detail__stats">
							<span>❤️ {likes} likes</span>
							<span aria-hidden>·</span>
							<span>👁 {product.productViews} views</span>
						</div>

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

						<div className="product-detail__delivery">
							🚚 Free delivery on orders over $50
						</div>

						{canPurchase && (
							<div className="product-detail__qty">
								<button className="product-detail__qty-btn" onClick={decQty} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
								<span className="product-detail__qty-val">{qty}</span>
								<button className="product-detail__qty-btn" onClick={incQty} aria-label="Increase quantity">+</button>
							</div>
						)}

						<div className="product-detail__actions">
							{canPurchase ? (
								<button
									type="button"
									className="btn btn--primary btn--lg product-detail__cart-btn"
									onClick={handleAddToCart}
								>
									🛒 Add to cart
								</button>
							) : (
								<button className="btn btn--primary btn--lg product-detail__cart-btn" disabled>
									{isSold ? 'Sold Out' : 'Out of Stock'}
								</button>
							)}
							<button
								type="button"
								className={`product-detail__like-btn${liked ? ' product-detail__like-btn--on' : ''}`}
								onClick={handleLike}
								aria-label="Add to wishlist"
							>
								{liked ? '❤️' : '🤍'}
							</button>
						</div>

						{seller && (
							<Link href={`/seller/${seller._id}`} className="product-detail__seller-card">
								<img
									src={sellerAvatar}
									alt={seller.memberNick}
									className="product-detail__seller-avatar"
									onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
								/>
								<div className="product-detail__seller-info">
									<p className="product-detail__seller-name">
										{seller.memberNick}
										{seller.memberType === 'SELLER' && (
											<span className="product-detail__seller-badge" aria-label="Verified seller">✓</span>
										)}
									</p>
									<p className="product-detail__seller-link">View store →</p>
								</div>
							</Link>
						)}
					</div>
				</div>

				{/* Description / details */}
				<div className="product-detail__sections">
					{product.productDesc && (
						<section className="product-detail__section">
							<h2 className="product-detail__section-title">Description</h2>
							<p className="product-detail__desc">{product.productDesc}</p>
						</section>
					)}

					<section className="product-detail__section">
						<h2 className="product-detail__section-title">Details</h2>
						<dl className="product-detail__specs">
							{product.productBrand && (
								<>
									<dt>Brand</dt>
									<dd>{product.productBrand}</dd>
								</>
							)}
							<dt>Pet type</dt>
							<dd>{typeCfg.icon} {typeCfg.label}</dd>
							<dt>Category</dt>
							<dd>{catCfg.icon} {catCfg.label}</dd>
							{product.productStock !== undefined && (
								<>
									<dt>Stock</dt>
									<dd>{product.productStock > 0 ? `${product.productStock} in stock` : 'Out of stock'}</dd>
								</>
							)}
						</dl>
					</section>

					<section className="product-detail__section">
						<h2 className="product-detail__section-title">Reviews</h2>
						<div className="product-detail__reviews-empty">
							<p>No reviews yet.</p>
							<p className="product-detail__reviews-cta">Be the first to review this product 🐾</p>
						</div>
					</section>
				</div>
			</section>
		</div>
	);
};

export default withLayoutBasic(ProductDetail);
