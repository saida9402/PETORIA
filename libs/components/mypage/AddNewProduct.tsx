import React, { useCallback, useRef, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Messages, API_URL } from '../../config';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { ProductInput } from '../../types/product/product.input';
import { ProductCategory, ProductType } from '../../enums/product.enum';
import { CREATE_PRODUCT, UPDATE_PRODUCT, IMAGES_UPLOADER } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetMixinSuccessAlert, sweetErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = /\.(jpe?g|png|webp)$/i;

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
	const user = useReactiveVar(userVar);
	const [productInput, setProductInput] = useState<ProductInput>(initialInput);
	const [productImages, setProductImages] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { productId } = router.query;
	const isSeller = user.memberType === 'SELLER';

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);
	const [imagesUploader] = useMutation(IMAGES_UPLOADER);

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
	const validateFile = (file: File): string | null => {
		const mimeOk = ACCEPTED_MIME.includes(file.type) || ACCEPTED_EXT.test(file.name);
		if (!mimeOk) return `${file.name}: unsupported format. Use JPG, PNG or WEBP.`;
		if (file.size > MAX_FILE_SIZE) {
			const mb = (file.size / (1024 * 1024)).toFixed(1);
			return `${file.name}: ${mb}MB exceeds 15MB limit.`;
		}
		return null;
	};

	const ingestFiles = async (rawFiles: FileList | File[]) => {
		const filesArr = Array.from(rawFiles);
		if (filesArr.length === 0) return;

		const currentCount = productImages.length;
		const room = MAX_IMAGES - currentCount;
		if (room <= 0) {
			await sweetErrorAlert(`Maximum ${MAX_IMAGES} images allowed.`);
			return;
		}

		const queued: File[] = [];
		for (const f of filesArr.slice(0, room)) {
			const err = validateFile(f);
			if (err) {
				console.error('UPLOAD_ERROR', 'validation', err);
				await sweetErrorAlert(err);
				continue;
			}
			queued.push(f);
		}
		if (queued.length === 0) return;

		setUploading(true);
		setUploadCount({ done: 0, total: queued.length });

		try {
			const { data } = await imagesUploader({
				variables: { files: queued, target: 'product' },
				context: { headers: { 'apollo-require-preflight': 'true' } },
			});
			const paths: string[] = (data?.imagesUploader ?? []).filter(Boolean);
			if (paths.length === 0) {
				console.error('UPLOAD_ERROR', 'empty response', data);
				await sweetErrorAlert('Upload failed: server returned no paths.');
				return;
			}
			setProductImages((prev) => {
				const combined = [...prev, ...paths].slice(0, MAX_IMAGES);
				setProductInput((prevInput) => ({ ...prevInput, productImages: combined }));
				return combined;
			});
			setUploadCount({ done: queued.length, total: queued.length });
		} catch (err: any) {
			console.error('UPLOAD_ERROR', err);
			sweetErrorHandling(err).then();
		} finally {
			setUploading(false);
			setUploadCount({ done: 0, total: 0 });
			if (inputRef.current) inputRef.current.value = '';
		}
	};

	const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		void ingestFiles(files);
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (uploading) return;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) void ingestFiles(files);
	};

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!dragActive) setDragActive(true);
	};

	const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	const removeImage = (index: number) => {
		setProductImages((prev) => {
			const updated = prev.filter((_, i) => i !== index);
			setProductInput((prevInput) => ({ ...prevInput, productImages: updated }));
			return updated;
		});
	};

	const submitHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (uploading) {
				await sweetErrorAlert('Please wait for image upload to finish.');
				return;
			}

			const payload: ProductInput = { ...productInput, productImages };

			if (productId) {
				await updateProduct({ variables: { input: { _id: productId, ...payload } } });
				await sweetMixinSuccessAlert('Product updated successfully!');
			} else {
				await createProduct({ variables: { input: payload } });
				await sweetMixinSuccessAlert('Product listed successfully!');
			}

			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			console.error('PRODUCT_SUBMIT_ERROR', err);
			sweetErrorHandling(err).then();
		}
	}, [productInput, productImages, uploading, productId, user._id, createProduct, updateProduct, router]);

	const isDisabled = () => {
		return (
			uploading ||
			productImages.length === 0 ||
			!productInput.productName ||
			!productInput.productBrand ||
			!productInput.productCategory ||
			!productInput.productType ||
			!productInput.productPrice
		);
	};

	if (device === 'mobile') {
		return <>ADD PRODUCT MOBILE</>;
	}

	return (
		<div id="add-product-page">
			{/* ── Store Identity Banner ── */}
			{isSeller && (
				<div className="anp-store-banner">
					<div className="anp-store-banner__left">
						<div className="anp-store-banner__avatar-wrap">
							<img
								src={user.memberImage ? `${API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
								alt={user.memberNick}
								className="anp-store-banner__avatar"
							/>
							<span className="anp-store-banner__verified">✓</span>
						</div>
						<div className="anp-store-banner__info">
							<span className="anp-store-banner__publishing">Publishing as</span>
							<span className="anp-store-banner__name">{user.memberNick}</span>
							<span className="anp-store-banner__badge">Verified Store</span>
						</div>
					</div>
					<div className="anp-store-banner__right">
						<div className="anp-store-banner__stat">
							<strong>{user.memberLikes ?? 0}</strong>
							<span>Likes</span>
						</div>
						<div className="anp-store-banner__stat">
							<strong>{user.memberViews ?? 0}</strong>
							<span>Views</span>
						</div>
						<Link href={`/seller/${user._id}`} className="anp-store-banner__link">
							View My Store →
						</Link>
					</div>
				</div>
			)}

			{/* ── Page Header ── */}
			<div className="anp-header">
				<div>
					<Typography className="anp-header__title">{productId ? '✏️ Edit Product' : '📦 List New Product'}</Typography>
					<Typography className="anp-header__sub">
						{productId
							? 'Update your product details and republish'
							: 'Fill in the details below to publish your product to the marketplace'}
					</Typography>
				</div>
			</div>

			<div className="anp-body">
				{/* ── Section 1: Product Images ── */}
				<Card className="anp-card" elevation={0}>
					<CardContent className="anp-card__content">
						<div className="anp-card__head">
							<span className="anp-card__icon">📷</span>
							<div>
								<Typography className="anp-card__title">Product Images</Typography>
								<Typography className="anp-card__desc">Upload up to 5 photos. First image is the cover.</Typography>
							</div>
						</div>

						<div
							className={`anp-image-grid ${dragActive ? 'anp-image-grid--drag' : ''}`}
							onDrop={onDrop}
							onDragOver={onDragOver}
							onDragEnter={onDragOver}
							onDragLeave={onDragLeave}
						>
							{productImages.map((img, idx) => (
								<div key={`${img}-${idx}`} className="anp-image-slot anp-image-slot--filled">
									<img src={`${API_URL}/${img}`} alt={`product-${idx}`} />
									{idx === 0 && <span className="anp-image-slot__cover">Cover</span>}
									<button
										type="button"
										className="anp-image-slot__remove"
										onClick={() => removeImage(idx)}
										disabled={uploading}
										aria-label={`Remove image ${idx + 1}`}
									>
										✕
									</button>
								</div>
							))}

							{uploading &&
								Array.from({ length: Math.max(0, uploadCount.total - uploadCount.done) }).map((_, i) => (
									<div key={`uploading-${i}`} className="anp-image-slot anp-image-slot--uploading">
										<CircularProgress size={28} thickness={4} />
										<span className="anp-image-slot__label">
											{uploadCount.done + 1}/{uploadCount.total}
										</span>
									</div>
								))}

							{!uploading && productImages.length < MAX_IMAGES && (
								<>
									<input
										ref={inputRef}
										type="file"
										hidden
										id="product-images"
										multiple
										accept="image/jpeg,image/png,image/webp"
										onChange={onFileInputChange}
									/>
									<label
										htmlFor="product-images"
										className={`anp-image-slot anp-image-slot--add ${dragActive ? 'is-drag' : ''}`}
									>
										<span className="anp-image-slot__plus">+</span>
										<span className="anp-image-slot__label">
											{dragActive ? 'Drop here' : 'Add Photo'}
										</span>
										<span className="anp-image-slot__hint">JPG · PNG · WEBP · ≤15MB</span>
									</label>
								</>
							)}
						</div>
						{uploading && (
							<Typography className="anp-upload-status">
								Uploading {uploadCount.done}/{uploadCount.total}…
							</Typography>
						)}
					</CardContent>
				</Card>

				{/* ── Section 2: Product Details ── */}
				<Card className="anp-card" elevation={0}>
					<CardContent className="anp-card__content">
						<div className="anp-card__head">
							<span className="anp-card__icon">🏷️</span>
							<div>
								<Typography className="anp-card__title">Product Details</Typography>
								<Typography className="anp-card__desc">Basic information about your product.</Typography>
							</div>
						</div>

						<div className="anp-form-grid">
							<div className="anp-field anp-field--full">
								<label className="anp-field__label">Product Name *</label>
								<input
									className="anp-field__input"
									type="text"
									placeholder="e.g. Royal Canin Adult Dog Food 10kg"
									value={productInput.productName}
									onChange={({ target: { value } }) => setProductInput({ ...productInput, productName: value })}
								/>
							</div>

							<div className="anp-field">
								<label className="anp-field__label">Brand *</label>
								<input
									className="anp-field__input"
									type="text"
									placeholder="e.g. Royal Canin"
									value={productInput.productBrand}
									onChange={({ target: { value } }) => setProductInput({ ...productInput, productBrand: value })}
								/>
							</div>

							<div className="anp-field">
								<label className="anp-field__label">Size / Weight</label>
								<input
									className="anp-field__input"
									type="text"
									placeholder="e.g. 5KG, M, XL"
									value={productInput.productSize ?? ''}
									onChange={({ target: { value } }) => setProductInput({ ...productInput, productSize: value })}
								/>
							</div>
						</div>

						{/* Pet Type */}
						<div className="anp-chip-group">
							<label className="anp-field__label">Pet Type *</label>
							<div className="anp-chips">
								{PET_TYPES.map((p) => (
									<Chip
										key={p.value}
										label={p.label}
										onClick={() => setProductInput({ ...productInput, productType: p.value })}
										className={`anp-chip ${productInput.productType === p.value ? 'anp-chip--active' : ''}`}
										variant={productInput.productType === p.value ? 'filled' : 'outlined'}
									/>
								))}
							</div>
						</div>

						{/* Category */}
						<div className="anp-chip-group">
							<label className="anp-field__label">Category *</label>
							<div className="anp-chips">
								{PRODUCT_CATEGORIES.map((c) => (
									<Chip
										key={c.value}
										label={c.label}
										onClick={() => setProductInput({ ...productInput, productCategory: c.value })}
										className={`anp-chip ${productInput.productCategory === c.value ? 'anp-chip--active' : ''}`}
										variant={productInput.productCategory === c.value ? 'filled' : 'outlined'}
									/>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* ── Section 3: Inventory & Pricing ── */}
				<Card className="anp-card" elevation={0}>
					<CardContent className="anp-card__content">
						<div className="anp-card__head">
							<span className="anp-card__icon">💰</span>
							<div>
								<Typography className="anp-card__title">Inventory & Pricing</Typography>
								<Typography className="anp-card__desc">Set your price and available stock.</Typography>
							</div>
						</div>

						<div className="anp-form-grid">
							<div className="anp-field">
								<label className="anp-field__label">Price (USD) *</label>
								<div className="anp-field__prefix-wrap">
									<span className="anp-field__prefix">$</span>
									<input
										className="anp-field__input anp-field__input--prefixed"
										type="number"
										placeholder="0.00"
										min={0}
										value={productInput.productPrice || ''}
										onChange={({ target: { value } }) =>
											setProductInput({ ...productInput, productPrice: Number(value) })
										}
									/>
								</div>
							</div>

							<div className="anp-field">
								<label className="anp-field__label">Stock Quantity</label>
								<input
									className="anp-field__input"
									type="number"
									placeholder="Available units"
									min={0}
									value={productInput.productStock || ''}
									onChange={({ target: { value } }) =>
										setProductInput({ ...productInput, productStock: Number(value) })
									}
								/>
							</div>
						</div>

						{/* Sale toggle */}
						<div className="anp-sale-row">
							<label className="anp-sale-toggle">
								<input
									type="checkbox"
									className="anp-sale-toggle__check"
									checked={productInput.productSale ?? false}
									onChange={({ target: { checked } }) => setProductInput({ ...productInput, productSale: checked })}
								/>
								<span className="anp-sale-toggle__track" />
								<span className="anp-sale-toggle__label">On Sale</span>
							</label>

							{productInput.productSale && (
								<div className="anp-field anp-field--inline">
									<label className="anp-field__label">Discount %</label>
									<input
										className="anp-field__input"
										type="number"
										placeholder="e.g. 20"
										min={1}
										max={99}
										value={productInput.productSalePercent ?? ''}
										onChange={({ target: { value } }) =>
											setProductInput({ ...productInput, productSalePercent: Number(value) })
										}
									/>
								</div>
							)}

							{productInput.productSale && productInput.productSalePercent && productInput.productPrice ? (
								<div className="anp-sale-preview">
									<span>Sale price: </span>
									<strong>
										${(productInput.productPrice * (1 - productInput.productSalePercent / 100)).toFixed(2)}
									</strong>
									<span className="anp-sale-preview__original">${productInput.productPrice.toFixed(2)}</span>
								</div>
							) : null}
						</div>
					</CardContent>
				</Card>

				{/* ── Section 4: Description ── */}
				<Card className="anp-card" elevation={0}>
					<CardContent className="anp-card__content">
						<div className="anp-card__head">
							<span className="anp-card__icon">📝</span>
							<div>
								<Typography className="anp-card__title">Product Description</Typography>
								<Typography className="anp-card__desc">Tell buyers what makes your product special.</Typography>
							</div>
						</div>

						<textarea
							className="anp-textarea"
							rows={6}
							placeholder="Describe ingredients, benefits, sizing, usage instructions..."
							value={productInput.productDesc ?? ''}
							onChange={({ target: { value } }) => setProductInput({ ...productInput, productDesc: value })}
						/>
					</CardContent>
				</Card>

				{/* ── Submit ── */}
				<div className="anp-submit">
					<Button className="anp-submit__btn" onClick={submitHandler} disabled={isDisabled()} variant="contained">
						{uploading ? (
							<>
								<CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} />
								Uploading images…
							</>
						) : productId ? (
							'Update Product'
						) : (
							'Publish to Marketplace'
						)}
					</Button>
					{isDisabled() && !uploading && (
						<Typography className="anp-submit__hint">
							* Add at least one image and fill in name, brand, pet type, category and price to publish.
						</Typography>
					)}
				</div>
			</div>
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
