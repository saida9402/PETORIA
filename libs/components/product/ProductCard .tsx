import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Product } from '../../types/product/product';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { API_URL, topProductRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface ProductCardType {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyViewed?: boolean;
}

const ProductCard = (props: ProductCardType) => {
	const { product, likeProductHandler, myFavorites, recentlyViewed } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = product?.productImages[0]
		? `${API_URL}/${product?.productImages[0]}`
		: '/img/banner/defaultProduct.svg';

	if (device === 'mobile') {
		return <div>PRODUCT CARD MOBILE</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link href={{ pathname: '/shop/detail', query: { id: product?._id } }}>
						<img src={imagePath} alt={product?.productName} />
					</Link>

					{/* TOP badge */}
					{product && product?.productRank > topProductRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}

					{/* Sale badge */}
					{product?.productSale && product?.productSalePercent && (
						<Box component={'div'} className={'sale-badge'}>
							<Typography>-{product.productSalePercent}%</Typography>
						</Box>
					)}

					{/* Price box */}
					<Box component={'div'} className={'price-box'}>
						<Typography>${formatterStr(product?.productPrice)}</Typography>
					</Box>
				</Stack>

				<Stack className="bottom">
					<Stack className="name-address">
						{/* Brand */}
						<Stack className="name">
							<Typography className="brand-label">{product?.productBrand}</Typography>
							<Link href={{ pathname: '/shop/detail', query: { id: product?._id } }}>
								<Typography>{product?.productName}</Typography>
							</Link>
						</Stack>

						{/* Category + Type */}
						<Stack className="address">
							<Typography>
								{product?.productCategory} · {product?.productType}
								{product?.productSize ? ` · ${product?.productSize}` : ''}
							</Typography>
						</Stack>
					</Stack>

					{/* Product details */}
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/category.svg" alt="" />
							<Typography>{product?.productCategory}</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/stock.svg" alt="" />
							<Typography>
								{product?.productStock > 0 ? `${product?.productStock} in stock` : 'Out of stock'}
							</Typography>
						</Stack>
						{product?.productSize && (
							<Stack className="option">
								<img src="/img/icons/expand.svg" alt="" />
								<Typography>{product?.productSize}</Typography>
							</Stack>
						)}
					</Stack>

					<Stack className="divider" />

					{/* Bottom row */}
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={product?.productSale ? '' : 'disabled-type'}
							>
								Sale
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={product?.productStock > 0 ? '' : 'disabled-type'}
							>
								In Stock
							</Typography>
						</Stack>

						{!recentlyViewed && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{product?.productViews}</Typography>
								<IconButton color={'default'} onClick={() => likeProductHandler(user, product?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : product?.meLiked && product?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{product?.productLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default ProductCard;
