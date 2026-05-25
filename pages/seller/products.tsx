import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Typography, Pagination, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_SELLER_PRODUCTS } from '../../apollo/user/query';
import { UPDATE_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Product } from '../../libs/types/product/product';
import { SellerProductsInquiry } from '../../libs/types/product/product.input';
import { ProductStatus } from '../../libs/enums/product.enum';
import { API_URL } from '../../libs/config';
import { T } from '../../libs/types/common';
import { sweetConfirmAlert, sweetErrorHandling } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SellerProducts: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [searchFilter, setSearchFilter] = useState<SellerProductsInquiry>(initialInput);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const { refetch } = useQuery(GET_SELLER_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user._id || user.memberType !== 'SELLER',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getSellerProducts?.list ?? []);
			setTotal(data?.getSellerProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) {
			router.replace('/account/join').then();
		} else if (user.memberType !== 'SELLER') {
			router.replace('/mypage').then();
		}
	}, [user]);

	/** COMPUTED **/
	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) return products;
		const q = searchQuery.toLowerCase();
		return products.filter(
			(p) => p.productName.toLowerCase().includes(q) || p.productBrand.toLowerCase().includes(q),
		);
	}, [products, searchQuery]);

	/** HANDLERS **/
	const statusTabHandler = (status: ProductStatus) => {
		setSearchFilter((prev) => ({ ...prev, page: 1, search: { productStatus: status } }));
	};

	const paginationHandler = (_: any, value: number) => {
		setSearchFilter((prev) => ({ ...prev, page: value }));
	};

	const deleteHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Delete this product? This cannot be undone.'))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.DELETE } } });
			await refetch({ input: searchFilter });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const markSoldHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Mark this product as Sold Out?'))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.SOLD } } });
			await refetch({ input: searchFilter });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const reactivateHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Reactivate this product?'))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.ACTIVE } } });
			await refetch({ input: searchFilter });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const activeStatus = searchFilter.search.productStatus ?? ProductStatus.ACTIVE;

	if (device === 'mobile') {
		return <div>SELLER PRODUCTS MOBILE</div>;
	}

	return (
		<div id="seller-products-page">
			<div className="container">
				{/* ── Header ── */}
				<div className="spg-header">
					<div>
						<Typography className="spg-header__title">Products Management</Typography>
						<Typography className="spg-header__sub">Manage your store listings</Typography>
					</div>
					<Link href="/mypage?category=addProduct" className="spg-add-btn">
						<AddBoxIcon sx={{ fontSize: 18 }} />
						Add New Product
					</Link>
				</div>

				{/* ── Toolbar: Search + Tabs ── */}
				<div className="spg-toolbar">
					<div className="spg-search">
						<SearchIcon className="spg-search__icon" />
						<InputBase
							className="spg-search__input"
							placeholder="Search by name or brand..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="spg-tabs">
						{[ProductStatus.ACTIVE, ProductStatus.SOLD, ProductStatus.DELETE].map((s) => (
							<button
								key={s}
								className={`spg-tab ${activeStatus === s ? 'spg-tab--active' : ''}`}
								onClick={() => statusTabHandler(s)}
							>
								{s === ProductStatus.ACTIVE && '🟢'} {s === ProductStatus.SOLD && '🟡'}{' '}
								{s === ProductStatus.DELETE && '🔴'} {s}
							</button>
						))}
					</div>
				</div>

				{/* ── Table ── */}
				<div className="spg-table">
					<div className="spg-table__head">
						<span className="spg-table__col spg-table__col--product">Product</span>
						<span className="spg-table__col">Category</span>
						<span className="spg-table__col">Price</span>
						<span className="spg-table__col">Stock</span>
						<span className="spg-table__col">Views</span>
						<span className="spg-table__col">Likes</span>
						<span className="spg-table__col">Actions</span>
					</div>

					{filteredProducts.length === 0 ? (
						<div className="no-data">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No products found.</p>
						</div>
					) : (
						filteredProducts.map((product: Product) => (
							<div key={product._id} className="spg-table__row">
								<div className="spg-table__col spg-table__col--product">
									<div className="spg-product-cell">
										<img
											src={
												product.productImages?.[0]
													? `${API_URL}/${product.productImages[0]}`
													: '/img/product/defaultProduct.svg'
											}
											alt={product.productName}
											className="spg-product-cell__img"
										/>
										<div>
											<Typography className="spg-product-cell__name">{product.productName}</Typography>
											<Typography className="spg-product-cell__brand">{product.productBrand}</Typography>
										</div>
									</div>
								</div>
								<span className="spg-table__col">
									<span className="spg-cat-chip">{product.productCategory}</span>
								</span>
								<span className="spg-table__col spg-table__col--price">
									${product.productPrice.toLocaleString()}
									{product.productSale && product.productSalePercent && (
										<span className="spg-sale-badge">-{product.productSalePercent}%</span>
									)}
								</span>
								<span
									className={`spg-table__col ${product.productStock <= 5 ? 'spg-table__col--warn' : ''}`}
								>
									{product.productStock}
									{product.productStock <= 5 && product.productStock > 0 && ' ⚠️'}
								</span>
								<span className="spg-table__col">{product.productViews}</span>
								<span className="spg-table__col">{product.productLikes}</span>
								<span className="spg-table__col">
									<div className="spg-actions">
										{activeStatus === ProductStatus.ACTIVE && (
											<>
												<button
													className="spg-action-btn spg-action-btn--sold"
													onClick={() => markSoldHandler(product._id)}
													title="Mark as Sold"
												>
													<CheckCircleIcon sx={{ fontSize: 15 }} />
												</button>
												<button
													className="spg-action-btn spg-action-btn--delete"
													onClick={() => deleteHandler(product._id)}
													title="Delete"
												>
													<DeleteIcon sx={{ fontSize: 15 }} />
												</button>
											</>
										)}
										{activeStatus === ProductStatus.SOLD && (
											<>
												<button
													className="spg-action-btn spg-action-btn--reactivate"
													onClick={() => reactivateHandler(product._id)}
													title="Reactivate"
												>
													<InventoryIcon sx={{ fontSize: 15 }} />
												</button>
												<button
													className="spg-action-btn spg-action-btn--delete"
													onClick={() => deleteHandler(product._id)}
													title="Delete"
												>
													<DeleteIcon sx={{ fontSize: 15 }} />
												</button>
											</>
										)}
										{activeStatus === ProductStatus.DELETE && (
											<button
												className="spg-action-btn spg-action-btn--reactivate"
												onClick={() => reactivateHandler(product._id)}
												title="Restore"
											>
												<InventoryIcon sx={{ fontSize: 15 }} />
											</button>
										)}
									</div>
								</span>
							</div>
						))
					)}
				</div>

				{/* ── Pagination ── */}
				{total > searchFilter.limit && (
					<Stack className="spg-pagination" direction="row" justifyContent="center" alignItems="center" gap={2}>
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="spg-total">{total} product{total !== 1 ? 's' : ''} total</Typography>
					</Stack>
				)}
			</div>
		</div>
	);
};

SellerProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: { productStatus: 'ACTIVE' },
	},
};

export default withLayoutBasic(SellerProducts);
