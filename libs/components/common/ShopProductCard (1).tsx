import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Product } from '../../types/product/product';
import { ProductType } from '../../enums/product.enum';
import { API_URL } from '../../config';

interface ShopProductCardProps {
	product: Product;
	likeProductHandler?: (user: any, id: string) => void;
	addToCartHandler?: (id: string) => void;
	memberPage?: boolean;
	myFavorites?: boolean;
	recentlyViewed?: boolean;
}

const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const ShopProductCard = (props: ShopProductCardProps) => {
	const { product, likeProductHandler, addToCartHandler, memberPage, myFavorites, recentlyViewed } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [cartAdded, setCartAdded] = useState(false);

	/** HANDLERS **/
	const pushProductDetail = async () => {
		await router.push({
			pathname: '/shop/detail',
			query: { id: product._id },
		});
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (addToCartHandler) {
			addToCartHandler(product._id);
			setCartAdded(true);
			setTimeout(() => setCartAdded(false), 1200);
		}
	};

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (likeProductHandler) likeProductHandler(user, product._id);
	};

	const discountPercent = product.productSale && product.productSalePercent ? product.productSalePercent : null;

	if (device === 'mobile') {
		return <div>SHOP PRODUCT CARD MOBILE</div>;
	}

	return (
		<Stack className="shop-product-card" onClick={pushProductDetail}>
			{/* ── Image area ── */}
			<Stack className="shop-product-card__img-wrap">
				{/* Badges */}
				{product.productSale && (
					<span className="shop-product-card__badge shop-product-card__badge--sale">
						Sale
					</span>
				)}
				{discountPercent && (
					<span className="shop-product-card__discount-badge">-{discountPercent}%</span>
				)}

				{/* Product image */}
				<img
					src={
						product.productImages?.[0]
							? `${API_URL}/${product.productImages[0]}`
							: '/img/product/defaultProduct.svg'
					}
					alt={product.productName}
					className="shop-product-card__img"
				/>

				{/* Like button */}
				<button
					className="shop-product-card__fav"
					onClick={handleLike}
					aria-label="Like product"
				>
					{product.meLiked && product.meLiked[0]?.myFavorite ? (
						<FavoriteIcon sx={{ color: '#e53935', fontSize: 18 }} />
					) : (
						<FavoriteBorderIcon sx={{ color: '#666', fontSize: 18 }} />
					)}
				</button>

				{/* Cart overlay */}
				<div className={`shop-product-card__cart-overlay${cartAdded ? ' visible' : ''}`}>
					<button
						className="shop-product-card__cart-btn"
						onClick={handleAddToCart}
						aria-label="Add to cart"
					>
						<ShoppingCartIcon sx={{ fontSize: 16 }} />
						<span>{cartAdded ? 'Added!' : 'Add to Cart'}</span>
					</button>
				</div>
			</Stack>

			{/* ── Body ── */}
			<Stack className="shop-product-card__body">
				{/* Brand */}
				<Typography className="shop-product-card__brand">
					{product.productBrand}
				</Typography>

				{/* Name */}
				<Typography className="shop-product-card__name">
					{product.productName}
				</Typography>

				{/* Product type tag */}
				{product.productType && (
					<span className="shop-product-card__pet-tag">
						{product.productType === ProductType.DOG && '🐶'}
						{product.productType === ProductType.CAT && '🐱'}
						{product.productType === ProductType.BIRD && '🐦'}
						{product.productType === ProductType.FISH && '🐠'}
						{' '}{product.productType}
					</span>
				)}

				<hr className="shop-product-card__divider" />

				{/* Footer */}
				<Stack className="shop-product-card__footer" direction="row" alignItems="center" justifyContent="space-between">
					{/* Price */}
					<Stack className="shop-product-card__price-box">
						<Typography className="shop-product-card__price">
							${product.productPrice.toLocaleString()}
						</Typography>
						{product.productSale && product.productSalePercent && (
							<Typography className="shop-product-card__original-price">
								-{product.productSalePercent}% off
							</Typography>
						)}
					</Stack>

					{/* Stats */}
					<Stack direction="row" gap={1} className="shop-product-card__stats">
						<Box className="shop-product-card__stat">
							<FavoriteBorderIcon sx={{ fontSize: 13 }} />
							<span>{formatNum(product.productLikes ?? 0)}</span>
						</Box>
						<Box className="shop-product-card__stat">
							<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
							<span>{formatNum(product.productViews ?? 0)}</span>
						</Box>
					</Stack>
				</Stack>

				{/* Stock warning */}
				{product.productStock !== undefined && product.productStock <= 5 && product.productStock > 0 && (
					<Typography className="shop-product-card__stock-warn">
						⚠️ Only {product.productStock} left!
					</Typography>
				)}
				{product.productStock === 0 && (
					<Typography className="shop-product-card__out-of-stock">
						Out of Stock
					</Typography>
				)}
			</Stack>
		</Stack>
	);
};

export default ShopProductCard;
