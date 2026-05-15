import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProductStatus } from '../../enums/product.enum';

interface ProductCardProps {
	product: Product;
	deleteProductHandler?: any;
	memberPage?: boolean;
	updateProductHandler?: any;
}

export const ProductCard = (props: ProductCardProps) => {
	const { product, deleteProductHandler, memberPage, updateProductHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProduct = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProduct', productId: id },
		});
	};

	const pushProductDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/shop/detail',
				query: { id: id },
			});
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <div>MOBILE PRODUCT CARD</div>;
	} else
		return (
			<Stack className="product-card-box">
				{/* Thumbnail */}
				<Stack className="image-box" onClick={() => pushProductDetail(product?._id)}>
					<img
						src={`${process.env.REACT_APP_API_URL}/${product.productImages[0]}`}
						alt={product.productName}
					/>
					{product.productBadge && (
						<span className={`badge badge--${product.productBadge.toLowerCase()}`}>
							{product.productBadge}
						</span>
					)}
				</Stack>

				{/* Info */}
				<Stack className="information-box" onClick={() => pushProductDetail(product?._id)}>
					<Typography className="brand">{product.productBrand}</Typography>
					<Typography className="name">{product.productName}</Typography>
					<Typography className="price">
						<strong>${formatterStr(product?.productPrice)}</strong>
						{product?.productOriginalPrice && (
							<span className="original-price">${formatterStr(product?.productOriginalPrice)}</span>
						)}
					</Typography>
					<Typography className="stock">
						Stock: <strong>{product.productStock ?? 0}</strong>
					</Typography>
				</Stack>

				{/* Date */}
				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{product.createdAt}</Moment>
					</Typography>
				</Stack>

				{/* Status badge */}
				<Stack className="status-box">
					<Stack
						className="coloured-box"
						sx={{
							background:
								product.productStatus === 'ACTIVE'
									? '#E8F5D0'
									: product.productStatus === 'SOLD'
									? '#FFF3CD'
									: '#FFE5E5',
						}}
						onClick={handleClick}
					>
						<Typography
							className="status"
							sx={{
								color:
									product.productStatus === 'ACTIVE'
										? '#2D5016'
										: product.productStatus === 'SOLD'
										? '#856404'
										: '#721c24',
							}}
						>
							{product.productStatus}
						</Typography>
					</Stack>
				</Stack>

				{/* Status change menu */}
				{!memberPage && product.productStatus !== 'SOLD' && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
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
						{product.productStatus === 'ACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateProductHandler(ProductStatus.SOLD, product?._id);
								}}
							>
								Mark Sold
							</MenuItem>
						)}
						{product.productStatus === 'ACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateProductHandler(ProductStatus.INACTIVE, product?._id);
								}}
							>
								Deactivate
							</MenuItem>
						)}
						{product.productStatus === 'INACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateProductHandler(ProductStatus.ACTIVE, product?._id);
								}}
							>
								Activate
							</MenuItem>
						)}
					</Menu>
				)}

				{/* Views */}
				<Stack className="views-box">
					<Typography className="views">{product.productViews?.toLocaleString() ?? 0}</Typography>
				</Stack>

				{/* Actions */}
				{!memberPage && product.productStatus === ProductStatus.ACTIVE && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditProduct(product._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton
							className="icon-button"
							onClick={() => deleteProductHandler(product._id)}
						>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
};
