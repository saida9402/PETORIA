import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Messages, API_URL } from '../../config';
import { getJwtToken } from '../../auth';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { ProductInput } from '../../types/product/product.input';
import { ProductCategory, ProductType } from '../../enums/product.enum';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const PRODUCT_CATEGORIES = [
	{ value: ProductCategory.FOOD, label: '🍖 Food & Treats' },
	{ value: ProductCategory.MEDICINE, label: '💊 Medicine & Health' },
	{ value: ProductCategory.ACCESSORY, label: '🎀 Accessories' },
	{ value: ProductCategory.TOY, label: '🎾 Toys' },
];

const PET_TYPES = [
	{ value: ProductType.DOG, label: '🐶 Dog' },
	{ value: ProductType.CAT, label: '🐱 Cat' },
	{ value: ProductType.BIRD, label: '🐦 Bird' },
	{ value: ProductType.FISH, label: '🐠 Fish' },
];

const AddNewProduct: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [productInput, setProductInput] = useState<ProductInput>(initialInput);
	const [productImages, setProductImages] = useState<string[]>([]);
	const { productId } = router.query;

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const { loading: getProductLoading, data: getProductData } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId: productId },
		skip: !productId,
		onCompleted: (data: T) => {
			if (data?.getProduct) {
				const p = data.getProduct;
				setProductInput({
					productType: p.productType,
					productCategory: p.productCategory,
					productName: p.productName,
					productBrand: p.productBrand,
					productSize: p.productSize,
					productPrice: p.productPrice,
					productStock: p.productStock,
					productImages: p.productImages,
					productDesc: p.productDesc,
					productSale: p.productSale,
					productSalePercent: p.productSalePercent,
				});
				setProductImages(p.productImages || []);
			}
		},
	});

	/** HANDLERS **/
	const uploadImages = async (e: any) => {
		try {
			const files: FileList = e.target.files;
			const uploaded: string[] = [];

			for (let i = 0; i < Math.min(files.length, 5 - productImages.length); i++) {
				const formData = new FormData();
				formData.append(
					'operations',
					JSON.stringify({
						query: `mutation ImageUploader($file: Upload!, $target: String!) {
							imageUploader(file: $file, target: $target)
						}`,
						variables: { file: null, target: 'product' },
					}),
				);
				formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
				formData.append('0', files[i]);

				const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						'apollo-require-preflight': true,
						Authorization: `Bearer ${token}`,
					},
				});
				uploaded.push(response.data.data.imageUploader);
			}

			const combined = [...productImages, ...uploaded].slice(0, 5);
			setProductImages(combined);
			setProductInput({ ...productInput, productImages: combined });
		} catch (err) {
			console.log('Error uploading images:', err);
		}
	};

	const removeImage = (index: number) => {
		const updated = productImages.filter((_, i) => i !== index);
		setProductImages(updated);
		setProductInput({ ...productInput, productImages: updated });
	};

	const submitHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			productInput.productImages = productImages;

			if (productId) {
				await updateProduct({ variables: { input: { _id: productId, ...productInput } } });
				await sweetMixinSuccessAlert('Product updated successfully!');
			} else {
				await createProduct({ variables: { input: productInput } });
				await sweetMixinSuccessAlert('Product listed successfully!');
			}

			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [productInput, productImages]);

	const isDisabled = () => {
		return (
			!productInput.productName ||
			!productInput.productBrand ||
			!productInput.productCategory ||
			!productInput.productType ||
			!productInput.productPrice ||
			productImages.length === 0
		);
	};

	if (device === 'mobile') {
		return <>ADD PRODUCT MOBILE</>;
	}

	return (
		<div id="add-product-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{productId ? 'Edit Product' : 'Add New Product'}</Typography>
					<Typography className="sub-title">
						{productId ? 'Update your listing' : 'List a new product in the pet shop'}
					</Typography>
				</Stack>
			</Stack>

			<Stack className="product-form-box">
				{/* Images */}
				<Stack className="form-section">
					<Typography className="section-title">📷 Product Images (up to 5)</Typography>
					<Stack className="image-upload-area">
						<Stack className="uploaded-images">
							{productImages.map((img, idx) => (
								<Stack key={idx} className="img-preview">
									<img src={`${API_URL}/${img}`} alt={`product-${idx}`} />
									<button className="remove-btn" onClick={() => removeImage(idx)}>
										✕
									</button>
								</Stack>
							))}
							{productImages.length < 5 && (
								<>
									<input
										type="file"
										hidden
										id="product-images"
										multiple
										accept="image/jpg, image/jpeg, image/png, image/webp"
										onChange={uploadImages}
									/>
									<label htmlFor="product-images" className="upload-placeholder">
										<span>+</span>
										<Typography>Add Photo</Typography>
									</label>
								</>
							)}
						</Stack>
					</Stack>
				</Stack>

				{/* Basic Info */}
				<Stack className="form-section">
					<Typography className="section-title">📦 Product Information</Typography>
					<Stack className="form-grid">
						<Stack className="input-box">
							<Typography className="label">Product Name *</Typography>
							<input
								type="text"
								placeholder="e.g. Royal Canin Adult Dog Food"
								value={productInput.productName}
								onChange={({ target: { value } }) => setProductInput({ ...productInput, productName: value })}
							/>
						</Stack>

						<Stack className="input-box">
							<Typography className="label">Brand *</Typography>
							<input
								type="text"
								placeholder="e.g. Royal Canin"
								value={productInput.productBrand}
								onChange={({ target: { value } }) => setProductInput({ ...productInput, productBrand: value })}
							/>
						</Stack>

						{/* productType — ProductInput da bor */}
						<Stack className="input-box">
							<Typography className="label">Pet Type *</Typography>
							<select
								value={productInput.productType ?? ''}
								onChange={({ target: { value } }) =>
									setProductInput({ ...productInput, productType: value as ProductType })
								}
							>
								<option value="">Select pet type</option>
								{PET_TYPES.map((p) => (
									<option key={p.value} value={p.value}>
										{p.label}
									</option>
								))}
							</select>
						</Stack>

						{/* productCategory — ProductInput da bor */}
						<Stack className="input-box">
							<Typography className="label">Category *</Typography>
							<select
								value={productInput.productCategory ?? ''}
								onChange={({ target: { value } }) =>
									setProductInput({ ...productInput, productCategory: value as ProductCategory })
								}
							>
								<option value="">Select category</option>
								{PRODUCT_CATEGORIES.map((c) => (
									<option key={c.value} value={c.value}>
										{c.label}
									</option>
								))}
							</select>
						</Stack>

						<Stack className="input-box">
							<Typography className="label">Price ($) *</Typography>
							<input
								type="number"
								placeholder="0.00"
								min={0}
								value={productInput.productPrice || ''}
								onChange={({ target: { value } }) => setProductInput({ ...productInput, productPrice: Number(value) })}
							/>
						</Stack>

						<Stack className="input-box">
							<Typography className="label">Stock Quantity</Typography>
							<input
								type="number"
								placeholder="Available units"
								min={0}
								value={productInput.productStock || ''}
								onChange={({ target: { value } }) => setProductInput({ ...productInput, productStock: Number(value) })}
							/>
						</Stack>

						{/* productSize — ProductInput da bor */}
						<Stack className="input-box">
							<Typography className="label">Size / Weight</Typography>
							<input
								type="text"
								placeholder="e.g. 5KG, M, XL"
								value={productInput.productSize ?? ''}
								onChange={({ target: { value } }) => setProductInput({ ...productInput, productSize: value })}
							/>
						</Stack>
					</Stack>
				</Stack>

				{/* Sale — productSale va productSalePercent ProductInput da bor */}
				<Stack className="form-section">
					<Typography className="section-title">🔥 Sale Settings</Typography>
					<Stack direction="row" alignItems="center" gap={2}>
						<Stack direction="row" alignItems="center" gap={1}>
							<input
								type="checkbox"
								id="productSale"
								checked={productInput.productSale ?? false}
								onChange={({ target: { checked } }) => setProductInput({ ...productInput, productSale: checked })}
							/>
							<label htmlFor="productSale">On Sale</label>
						</Stack>
						{productInput.productSale && (
							<Stack className="input-box" style={{ width: '150px' }}>
								<Typography className="label">Discount %</Typography>
								<input
									type="number"
									placeholder="e.g. 20"
									min={1}
									max={99}
									value={productInput.productSalePercent ?? ''}
									onChange={({ target: { value } }) =>
										setProductInput({ ...productInput, productSalePercent: Number(value) })
									}
								/>
							</Stack>
						)}
					</Stack>
				</Stack>

				{/* Description */}
				<Stack className="form-section">
					<Typography className="section-title">📝 Description</Typography>
					<textarea
						className="desc-textarea"
						rows={5}
						placeholder="Describe your product..."
						value={productInput.productDesc ?? ''}
						onChange={({ target: { value } }) => setProductInput({ ...productInput, productDesc: value })}
					/>
				</Stack>

				{/* Submit */}
				<Stack className="submit-box">
					<Button className="submit-button" onClick={submitHandler} disabled={isDisabled()}>
						<Typography>{productId ? 'Update Product' : 'List Product'}</Typography>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
							<g clipPath="url(#clip0)">
								<path
									d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
									fill="white"
								/>
							</g>
							<defs>
								<clipPath id="clip0">
									<rect width="13" height="13" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};

AddNewProduct.defaultProps = {
	initialInput: {
		productType: '' as ProductType,
		productCategory: '' as ProductCategory,
		productName: '',
		productBrand: '',
		productSize: '',
		productPrice: 0,
		productStock: 0,
		productImages: [],
		productDesc: '',
		productSale: false,
		productSalePercent: 0,
	},
};

export default AddNewProduct;
