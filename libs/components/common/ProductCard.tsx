import React, { useState } from 'react';
import { Box, Menu, MenuItem, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { formatterStr } from '../../utils';
import { API_URL, topProductRank } from '../../config';
import { userVar } from '../../../apollo/store';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { ProductStatus } from '../../enums/product.enum';

export interface ProductCardProps {
	product: Product;
	/** 'shop' = public browsing (like/view); 'mypage' = seller management (edit/delete/status) */
	variant?: 'shop' | 'mypage';
	// shop variant
	likeProductHandler?: (user: any, id: string) => void;
	myFavorites?: boolean;
	recentlyViewed?: boolean;
	// mypage variant
	deleteProductHandler?: (id: string) => void;
	updateProductHandler?: (status: ProductStatus, id: string) => void;
	memberPage?: boolean;
}

const STATUS_COLORS: Record<ProductStatus, { bg: string; text: string }> = {
	[ProductStatus.ACTIVE]: { bg: '#E8F5D0', text: '#2D5016' },
	[ProductStatus.SOLD]: { bg: '#FFF3CD', text: '#856404' },
	[ProductStatus.DELETE]: { bg: '#FFE5E5', text: '#721c24' },
};

const ProductCard = (props: ProductCardProps) => {
	const {
		product,
		variant = 'shop',
		likeProductHandler,
		myFavorites,
		recentlyViewed,
		deleteProductHandler,
		updateProductHandler,
		memberPage,
	} = props;

	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const imagePath = product?.productImages?.[0]
		? `${API_URL}/${product.productImages[0]}`
		: '/img/banner/defaultProduct.svg';

	const statusColors = STATUS_COLORS[product.productStatus] ?? { bg: '#f0f0f0', text: '#333' };

	const pushProductDetail = (id: string) => {
		if (memberPage || variant === 'shop') {
			router.push({ pathname: '/shop/detail', query: { id } });
		}
	};

	const pushEditProduct = (id: string) => {
		router.push({ pathname: '/mypage', query: { category: 'addProduct', productId: id } });
	};

	if (device === 'mobile') {
		return <div>PRODUCT CARD MOBILE</div>;
	}

	// ── Mypage / seller variant ──────────────────────────────────────────────
	if (variant === 'mypage') {
		return (
			<Stack className="product-card-box">
				<Stack className="image-box" onClick={() => pushProductDetail(product._id)}>
					<img src={imagePath} alt={product.productName} />
				</Stack>

				<Stack className="information-box" onClick={() => pushProductDetail(product._id)}>
					<Typography className="brand">{product.productBrand}</Typography>
					<Typography className="name">{product.productName}</Typography>
					<Typography className="price">
						<strong>${formatterStr(product.productPrice)}</strong>
					</Typography>
					<Typography className="stock">
						Stock: <strong>{product.productStock ?? 0}</strong>
					</Typography>
				</Stack>

				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{product.createdAt}</Moment>
					</Typography>
				</Stack>

				<Stack className="status-box">
					<Stack
						className="coloured-box"
						sx={{ background: statusColors.bg }}
						onClick={(e: React.MouseEvent<HTMLDivElement>) => setAnchorEl(e.currentTarget)}
					>
						<Typography className="status" sx={{ color: statusColors.text }}>
							{product.productStatus}
						</Typography>
					</Stack>
				</Stack>

				{!memberPage && product.productStatus !== ProductStatus.SOLD && (
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={() => setAnchorEl(null)}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '90px',
								mt: 1,
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(45,80,22,0.2))',
							},
						}}
					>
						{product.productStatus === ProductStatus.ACTIVE && (
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									updateProductHandler?.(ProductStatus.SOLD, product._id);
								}}
							>
								Mark Sold
							</MenuItem>
						)}
						{product.productStatus === ProductStatus.ACTIVE && (
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									updateProductHandler?.(ProductStatus.DELETE, product._id);
								}}
							>
								Delete
							</MenuItem>
						)}
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{product.productViews?.toLocaleString() ?? 0}</Typography>
				</Stack>

				{!memberPage && product.productStatus === ProductStatus.ACTIVE && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditProduct(product._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deleteProductHandler?.(product._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
	}

	// ── Shop / public browsing variant ───────────────────────────────────────
	return (
		<Stack className="card-config">
			<Stack className="top">
				<Link href={{ pathname: '/shop/detail', query: { id: product._id } }}>
					<img src={imagePath} alt={product.productName} />
				</Link>

				{product.productRank > topProductRank && (
					<Box component={'div'} className={'top-badge'}>
						<img src="/img/icons/electricity.svg" alt="top-product" />
						<Typography>TOP</Typography>
					</Box>
				)}

				{product.productSale && product.productSalePercent && (
					<Box component={'div'} className={'sale-badge'}>
						<Typography>-{product.productSalePercent}%</Typography>
					</Box>
				)}

				<Box component={'div'} className={'price-box'}>
					<Typography>${formatterStr(product.productPrice)}</Typography>
				</Box>
			</Stack>

			<Stack className="bottom">
				<Stack className="name-address">
					<Stack className="name">
						<Typography className="brand-label">{product.productBrand}</Typography>
						<Link href={{ pathname: '/shop/detail', query: { id: product._id } }}>
							<Typography>{product.productName}</Typography>
						</Link>
					</Stack>
					<Stack className="address">
						<Typography>
							{product.productCategory}
							{product.productType ? ` · ${product.productType}` : ''}
							{product.productSize ? ` · ${product.productSize}` : ''}
						</Typography>
					</Stack>
				</Stack>

				<Stack className="options">
					<Stack className="option">
						<img src="/img/icons/category.svg" alt="category" />
						<Typography>{product.productCategory}</Typography>
					</Stack>
					<Stack className="option">
						<img src="/img/icons/stock.svg" alt="stock" />
						<Typography>
							{product.productStock > 0 ? `${product.productStock} in stock` : 'Out of stock'}
						</Typography>
					</Stack>
					{product.productSize && (
						<Stack className="option">
							<img src="/img/icons/expand.svg" alt="size" />
							<Typography>{product.productSize}</Typography>
						</Stack>
					)}
				</Stack>

				{/* Store identity */}
				{product.memberData && (
					<Link
						href={`/seller/${product.memberData._id}`}
						className="store-id-row"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={
								product.memberData.memberImage
									? `${API_URL}/${product.memberData.memberImage}`
									: '/img/profile/defaultUser.svg'
							}
							alt={product.memberData.memberNick}
							className="store-id-row__avatar"
						/>
						<span className="store-id-row__name">{product.memberData.memberNick}</span>
						<span className="store-id-row__badge">✓</span>
					</Link>
				)}

				<Stack className="divider" />

				<Stack className="type-buttons">
					<Stack className="type">
						<Typography
							sx={{ fontWeight: 500, fontSize: '13px' }}
							className={product.productSale ? '' : 'disabled-type'}
						>
							Sale
						</Typography>
						<Typography
							sx={{ fontWeight: 500, fontSize: '13px' }}
							className={product.productStock > 0 ? '' : 'disabled-type'}
						>
							In Stock
						</Typography>
					</Stack>

					{!recentlyViewed && (
						<Stack className="buttons">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{product.productViews ?? 0}</Typography>

							<IconButton
								color={'default'}
								onClick={() => likeProductHandler?.(user, product._id)}
							>
								{myFavorites || product?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon color="primary" />
								) : (
									<FavoriteBorderIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{product.productLikes ?? 0}</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default ProductCard;
