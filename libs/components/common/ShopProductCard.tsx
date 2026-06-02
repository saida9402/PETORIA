import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Product } from '../../types/product/product';
import { ProductType } from '../../enums/product.enum';
import { API_URL } from '../../config';
import { addToCart as addToCartStore } from '../../cart';

interface ShopProductCardProps {
	product: Product;
	likeProductHandler?: (id: string) => void;
	addToCartHandler?: (id: string) => void;
	memberPage?: boolean;
	myFavorites?: boolean;
	recentlyViewed?: boolean;
}

const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const ShopProductCard = (props: ShopProductCardProps) => {
	const { product, likeProductHandler, addToCartHandler, memberPage, myFavorites, recentlyViewed } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [cartAdded, setCartAdded] = useState(false);

	/** HANDLERS **/
	const pushProductDetail = async () => {
		await router.push(`/shop/${product._id}`);
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (addToCartHandler) {
			addToCartHandler(product._id);
		} else {
			addToCartStore({
				productId: product._id,
				productName: product.productName,
				productBrand: product.productBrand ?? '',
				productImage: product.productImages?.[0] ?? '',
				productPrice: product.productPrice,
				productType: product.productType,
			});
		}
		setCartAdded(true);
		setTimeout(() => setCartAdded(false), 1200);
	};

	const handleLike = (e: React.MouseEvent) => {
		console.log('handleLike fired', product._id);
		e.stopPropagation();
		e.preventDefault();
		if (likeProductHandler) likeProductHandler(product._id);
	};

	const discountPercent = product.productSale && product.productSalePercent ? product.productSalePercent : null;

	return (
		<Stack className="shop-product-card" onClick={pushProductDetail}>
			{/* ── Image area ── */}
			<Stack className="shop-product-card__img-wrap">
				{/* Badges */}
				{product.productSale && <span className="shop-product-card__badge shop-product-card__badge--sale">Sale</span>}
				{discountPercent && <span className="shop-product-card__discount-badge">-{discountPercent}%</span>}

				{/* Product image */}
				<img
					src={
						product.productImages?.[0]
							? product.productImages[0].startsWith('http')
								? product.productImages[0]
								: `${API_URL}/${product.productImages[0]}`
							: '/img/product/defaultProduct.svg'
					}
					alt={product.productName}
					className="shop-product-card__img"
				/>
			</Stack>

			{/* Like button — outside overflow:hidden img-wrap so it always receives clicks */}
			<button type="button" className="shop-product-card__fav" onClick={handleLike} aria-label="Like product">
				{product.meLiked && product.meLiked[0]?.myFavorite ? (
					<FavoriteIcon sx={{ color: '#e53935', fontSize: 18 }} />
				) : (
					<FavoriteBorderIcon sx={{ color: '#666', fontSize: 18 }} />
				)}
			</button>

			{/* ── Body ── */}
			<Stack className="shop-product-card__body">
				{/* Brand */}
				<Typography className="shop-product-card__brand">{product.productBrand}</Typography>

				{/* Name */}
				<Typography className="shop-product-card__name">{product.productName}</Typography>

				{/* Store identity */}
				{product.memberData && (
					<Link
						href={`/seller/${product.memberData._id}`}
						className="shop-product-card__store"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={
								product.memberData.memberImage
									? product.memberData.memberImage.startsWith('http')
										? product.memberData.memberImage
										: `${API_URL}/${product.memberData.memberImage}`
									: '/img/profile/defaultUser.svg'
							}
							alt={product.memberData.memberNick}
							className="shop-product-card__store-avatar"
						/>
						<span className="shop-product-card__store-name">{product.memberData.memberNick}</span>
						<span className="shop-product-card__store-badge">✓</span>
					</Link>
				)}

				{/* Product type tag */}
				{product.productType && (
					<span className="shop-product-card__pet-tag">
						{product.productType === ProductType.DOG && '🐶'}
						{product.productType === ProductType.CAT && '🐱'}
						{product.productType === ProductType.BIRD && '🐦'}
						{product.productType === ProductType.FISH && '🐠'} {product.productType}
					</span>
				)}

				<hr className="shop-product-card__divider" />

				{/* Footer */}
				<Stack className="shop-product-card__footer" direction="row" alignItems="center" justifyContent="space-between">
					{/* Price */}
					<Stack className="shop-product-card__price-box">
						<Typography className="shop-product-card__price">${product.productPrice.toLocaleString()}</Typography>
						{product.productSale && product.productSalePercent && (
							<Typography className="shop-product-card__original-price">-{product.productSalePercent}% off</Typography>
						)}
					</Stack>

					{/* Stats */}
					<Stack direction="row" gap={1} className="shop-product-card__stats">
						<div className="shop-product-card__stat">
							<FavoriteBorderIcon sx={{ fontSize: 13 }} />
							<span>{formatNum(product.productLikes ?? 0)}</span>
						</div>
						<div className="shop-product-card__stat">
							<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
							<span>{formatNum(product.productViews ?? 0)}</span>
						</div>
					</Stack>
				</Stack>

				{/* Stock warning */}
				{product.productStock !== undefined && product.productStock <= 5 && product.productStock > 0 && (
					<Typography className="shop-product-card__stock-warn">⚠️ Only {product.productStock} left!</Typography>
				)}
				{product.productStock === 0 && (
					<Typography className="shop-product-card__out-of-stock">Out of Stock</Typography>
				)}

				{/* Add to Cart — permanent, anchored to the bottom of the card */}
				<button
					type="button"
					className={`shop-product-card__cart-btn${cartAdded ? ' shop-product-card__cart-btn--added' : ''}`}
					onClick={handleAddToCart}
					disabled={product.productStock === 0}
					aria-label="Add to cart"
				>
					<ShoppingCartIcon sx={{ fontSize: 16 }} />
					<span>{cartAdded ? 'Added!' : 'Add to Cart'}</span>
				</button>
			</Stack>
		</Stack>
	);
};

export default ShopProductCard;
