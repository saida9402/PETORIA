import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { Button, Drawer, IconButton, Menu, MenuItem, Pagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CaretDown, X, SlidersHorizontal } from 'phosphor-react';
import { useMutation, useQuery } from '@apollo/client';

import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { Direction, ProductType, ProductCategory } from '../../libs/enums/product.enum';
import { T } from '../../libs/types/common';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import ShopFilter from '../../libs/components/product/ShopFilter';
import ProductCard from '../../libs/components/common/ProductCard';
import { useUrlSearchFilter } from '../../libs/hooks/useUrlSearchFilter';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Maps legacy inbound deep-links (/shop?type=DOG&cat=FOOD&text=…&productBrand=…)
 *  into a full inquiry when no `?input=` blob is present, so those links keep working. */
function deriveShopQuery(query: Record<string, any>, fallback: ProductsInquiry): ProductsInquiry {
	if (!(query.type || query.cat || query.text || query.productBrand)) return fallback;
	return {
		...fallback,
		search: {
			...(query.type ? { typeList: [query.type as ProductType] } : {}),
			...(query.cat ? { categoryList: [query.cat as ProductCategory] } : {}),
			...(query.text ? { text: query.text as string } : {}),
			...(query.productBrand ? { brandList: [query.productBrand as string] } : {}),
		},
	};
}

const SORT_OPTIONS = [
	{ id: 'newest',  label: 'Newest',       sort: 'createdAt',    direction: Direction.DESC },
	{ id: 'lowest',  label: 'Lowest Price',  sort: 'productPrice', direction: Direction.ASC  },
	{ id: 'highest', label: 'Highest Price', sort: 'productPrice', direction: Direction.DESC },
	{ id: 'popular', label: 'Most Popular',  sort: 'productLikes', direction: Direction.DESC },
];

function ProductSkeleton() {
	return (
		<div className="shop-skeleton">
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<div key={i} className="shop-skeleton__card" />
			))}
		</div>
	);
}

const ShopPage: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();

	// URL is the single source of truth for filters, sort and pagination.
	const [searchFilter, setSearchFilter] = useUrlSearchFilter<ProductsInquiry>(initialInput, deriveShopQuery);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	// Derived from the (URL-backed) filter so they restore correctly on refresh.
	const currentPage = searchFilter.page ?? 1;
	const filterSortName =
		SORT_OPTIONS.find((o) => o.sort === searchFilter.sort && o.direction === searchFilter.direction)?.label ??
		'Newest';

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const handlePaginationChange = (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			// The likeTargetProduct mutation returns the new productLikes count but not a
			// member-scoped `meLiked`, so the card can't derive its filled state from the
			// response. Mirror the working detail-page like button: toggle optimistically so
			// the heart flips immediately, then revert if the request fails. On refresh the
			// GET_PRODUCTS aggregation remains the source of truth.
			const snapshot = products;
			setProducts((prev) =>
				prev.map((p) => {
					if (p._id !== id) return p;
					const liked = !!p?.meLiked?.[0]?.myFavorite;
					return {
						...p,
						productLikes: Math.max(0, (p.productLikes ?? 0) + (liked ? -1 : 1)),
						meLiked: liked ? [] : [{ memberId: user._id, likeRefId: id, myFavorite: true }],
					};
				}),
			);

			try {
				await likeTargetProduct({ variables: { input: id } });
			} catch (mutationErr) {
				setProducts(snapshot); // revert the optimistic toggle on failure
				throw mutationErr;
			}

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const chosen = SORT_OPTIONS.find((o) => o.id === e.currentTarget.id);
		if (chosen) {
			setSearchFilter({ ...searchFilter, sort: chosen.sort, direction: chosen.direction, page: 1 });
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const resetFilters = () => {
		setSearchFilter(initialInput);
	};

	const totalPages = total > 0 ? Math.ceil(total / searchFilter.limit) : 0;

	const activeFilterCount = [
		(searchFilter.search.typeList?.length ?? 0) > 0,
		(searchFilter.search.categoryList?.length ?? 0) > 0,
		(searchFilter.search.brandList?.length ?? 0) > 0,
		!!searchFilter.search.text,
		!!(searchFilter.search.pricesRange),
		!!searchFilter.search.onSale,
	].filter(Boolean).length;

	if (device === 'mobile') {
		return (
			<div id="shop-list-page">

				{/* Sticky sort + filter action bar */}
				<div className="shop-mobile-bar">
					<span className="shop-mobile-bar__count">
						{loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
					</span>
					<div className="shop-mobile-bar__actions">
						<Button
							onClick={sortingClickHandler}
							endIcon={<CaretDown size={18} />}
							className="shop-sort-btn"
							aria-label={`Sort by ${filterSortName}`}
						>
							{filterSortName}
						</Button>
						<Menu
							anchorEl={anchorEl}
							open={sortingOpen}
							onClose={sortingCloseHandler}
							PaperProps={{ elevation: 2, sx: { mt: 1, borderRadius: '10px', minWidth: '160px' } }}
						>
							{SORT_OPTIONS.map((item) => (
								<MenuItem
									key={item.id}
									onClick={sortingHandler}
									id={item.id}
									disableRipple
									selected={filterSortName === item.label}
									sx={{ fontSize: '13px', py: 1 }}
								>
									{item.label}
								</MenuItem>
							))}
						</Menu>

						<Button
							onClick={() => setFilterDrawerOpen(true)}
							startIcon={<SlidersHorizontal size={20} />}
							className={`shop-filter-btn${activeFilterCount > 0 ? ' shop-filter-btn--active' : ''}`}
							aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
						>
							Filters
							{activeFilterCount > 0 && (
								<span className="shop-filter-count" aria-hidden="true">{activeFilterCount}</span>
							)}
						</Button>
					</div>
				</div>

				{/* Product area */}
				<div className="shop-wrap">
					{loading ? (
						<ProductSkeleton />
					) : products.length === 0 ? (
						<div className="shop-empty">
							<div className="shop-empty__icon">🔍</div>
							<h3>No products found</h3>
							<p>Try adjusting your filters or search terms.</p>
							<button className="btn btn--primary btn--sm" onClick={resetFilters}>
								Reset filters
							</button>
						</div>
					) : (
						<div className="shop-grid">
							{products.map((p) => (
								<ProductCard product={p} likeProductHandler={likeProductHandler} key={p._id} />
							))}
						</div>
					)}

					{!loading && totalPages > 1 && (
						<div className="shop-pagination">
							<Pagination
								page={currentPage}
								count={totalPages}
								onChange={handlePaginationChange}
								shape="rounded"
								color="primary"
								size="small"
							/>
							<p className="shop-pagination__total">
								Showing {Math.min((currentPage - 1) * searchFilter.limit + 1, total)}–
								{Math.min(currentPage * searchFilter.limit, total)} of {total}
							</p>
						</div>
					)}
				</div>

				{/* Bottom sheet filter drawer — keepMounted preserves ShopFilter local state */}
				<Drawer
					anchor="bottom"
					open={filterDrawerOpen}
					onClose={() => setFilterDrawerOpen(false)}
					className="shop-filter-drawer"
					ModalProps={{ keepMounted: true }}
				>
					<div className="shop-filter-drawer__content">
						<div className="shop-filter-drawer__top">
							<span className="shop-filter-drawer__handle" aria-hidden="true" />
							<IconButton
								onClick={() => setFilterDrawerOpen(false)}
								aria-label="Close filters"
								size="small"
								className="shop-filter-drawer__close"
							>
								<X size={20} />
							</IconButton>
						</div>
						<div className="shop-filter-drawer__body">
							<ShopFilter
								searchFilter={searchFilter}
								setSearchFilter={setSearchFilter}
								initialInput={initialInput}
							/>
						</div>
					</div>
				</Drawer>

			</div>
		);
	}

	return (
		<div id="shop-list-page">
			<div className="shop-wrap">

				{/* Sort bar */}
				<div className="shop-sort-bar">
					<span className="shop-sort-bar__count">
						{loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
					</span>
					<div className="shop-sort-bar__right">
						<span className="shop-sort-bar__label">Sort by</span>
						<Button
							onClick={sortingClickHandler}
							endIcon={<CaretDown size={18} />}
							className="shop-sort-btn"
						>
							{filterSortName}
						</Button>
						<Menu
							anchorEl={anchorEl}
							open={sortingOpen}
							onClose={sortingCloseHandler}
							PaperProps={{ elevation: 2, sx: { mt: 1, borderRadius: '10px', minWidth: '160px' } }}
						>
							{SORT_OPTIONS.map((item) => (
								<MenuItem
									key={item.id}
									onClick={sortingHandler}
									id={item.id}
									disableRipple
									selected={filterSortName === item.label}
									sx={{ fontSize: '13px', py: 1 }}
								>
									{item.label}
								</MenuItem>
							))}
						</Menu>
					</div>
				</div>

				{/* Main grid: sidebar + product area */}
				<div className="shop-layout">

					{/* Filter sidebar */}
					<aside className="shop-sidebar">
						<ShopFilter
							searchFilter={searchFilter}
							setSearchFilter={setSearchFilter}
							initialInput={initialInput}
						/>
					</aside>

					{/* Product area */}
					<main className="shop-main">
						{loading ? (
							<ProductSkeleton />
						) : products.length === 0 ? (
							<div className="shop-empty">
								<div className="shop-empty__icon">🔍</div>
								<h3>No products found</h3>
								<p>Try adjusting your filters or search terms.</p>
								<button className="btn btn--primary btn--sm" onClick={resetFilters}>
									Reset filters
								</button>
							</div>
						) : (
							<div className="shop-grid">
								{products.map((p) => (
									<ProductCard
										product={p}
										likeProductHandler={likeProductHandler}
										key={p._id}
									/>
								))}
							</div>
						)}

						{/* Pagination */}
						{!loading && totalPages > 1 && (
							<div className="shop-pagination">
								<Pagination
									page={currentPage}
									count={totalPages}
									onChange={handlePaginationChange}
									shape="rounded"
									color="primary"
									size="medium"
								/>
								<p className="shop-pagination__total">
									Showing {Math.min((currentPage - 1) * searchFilter.limit + 1, total)}–
									{Math.min(currentPage * searchFilter.limit, total)} of {total}
								</p>
							</div>
						)}
					</main>

				</div>
			</div>
		</div>
	);
};

ShopPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(ShopPage);
