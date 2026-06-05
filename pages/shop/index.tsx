import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Drawer, IconButton, Menu, MenuItem, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CloseIcon from '@mui/icons-material/Close';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useMutation, useQuery } from '@apollo/client';

import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';
import { Direction } from '../../libs/enums/product.enum';
import { T } from '../../libs/types/common';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import ShopFilter from '../../libs/components/product/ShopFilter';
import ProductCard from '../../libs/components/common/ProductCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

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
	const router = useRouter();

	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Newest');
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.input) {
			setSearchFilter(JSON.parse(router.query.input as string));
		} else if (router.query.type || router.query.cat || router.query.text || router.query.productBrand) {
			setSearchFilter({
				...initialInput,
				search: {
					...(router.query.type ? { typeList: [router.query.type as string] } : {}),
					...(router.query.cat ? { categoryList: [router.query.cat as string] } : {}),
					...(router.query.text ? { text: router.query.text as string } : {}),
					...(router.query.productBrand ? { brandList: [router.query.productBrand as string] } : {}),
				},
			});
		}
		setCurrentPage(searchFilter.page ?? 1);
	}, [router.query.input, router.query.type, router.query.cat, router.query.text, router.query.productBrand]);

	/* Keep query in sync whenever filter state changes */
	useEffect(() => {
		getProductsRefetch({ input: searchFilter });
	}, [searchFilter]);

	const handlePaginationChange = async (_: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		setSearchFilter(next);
		setCurrentPage(value);
		await router.push(`/shop?input=${JSON.stringify(next)}`, undefined, { scroll: false });
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetProduct({ variables: { input: id } });
			await getProductsRefetch({ input: searchFilter });
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
			setFilterSortName(chosen.label);
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const resetFilters = () => {
		setSearchFilter(initialInput);
		setFilterSortName('Newest');
		setCurrentPage(1);
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
							endIcon={<KeyboardArrowDownRoundedIcon />}
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
							startIcon={<TuneRoundedIcon />}
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
								<CloseIcon />
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
							endIcon={<KeyboardArrowDownRoundedIcon />}
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
