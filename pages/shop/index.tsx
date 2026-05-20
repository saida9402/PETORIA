import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
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

const ShopPage: NextPage = ({ initialInput, ...props }: any) => {
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

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
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
		}
		setCurrentPage(searchFilter.page ?? 1);
	}, [router]);

	const handlePaginationChange = async (_: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		await router.push(`/shop?input=${JSON.stringify(next)}`, undefined, { scroll: false });
		setCurrentPage(value);
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
		const sorts: Record<string, { sort: string; direction: Direction; label: string }> = {
			newest:  { sort: 'createdAt',    direction: Direction.DESC, label: 'Newest' },
			lowest:  { sort: 'productPrice', direction: Direction.ASC,  label: 'Lowest Price' },
			highest: { sort: 'productPrice', direction: Direction.DESC, label: 'Highest Price' },
			popular: { sort: 'productLikes', direction: Direction.DESC, label: 'Most Popular' },
		};
		const chosen = sorts[e.currentTarget.id];
		if (chosen) {
			setSearchFilter({ ...searchFilter, sort: chosen.sort, direction: chosen.direction });
			setFilterSortName(chosen.label);
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return (
			<Stack className="shop-page-mobile">
				{products.map((p) => (
					<ProductCard product={p} likeProductHandler={likeProductHandler} key={p._id} />
				))}
			</Stack>
		);
	}

	return (
		<div id="shop-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Box component="div" className="right">
					<span>Sort by</span>
					<div>
						<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
							{filterSortName}
						</Button>
						<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
							{[
								{ id: 'newest', label: 'Newest' },
								{ id: 'lowest', label: 'Lowest Price' },
								{ id: 'highest', label: 'Highest Price' },
								{ id: 'popular', label: 'Most Popular' },
							].map((item) => (
								<MenuItem key={item.id} onClick={sortingHandler} id={item.id} disableRipple
									sx={{ boxShadow: 'rgba(149,157,165,0.2) 0px 8px 24px' }}>
									{item.label}
								</MenuItem>
							))}
						</Menu>
					</div>
				</Box>

				<Stack className="shop-page">
					<Stack className="filter-config">
						<ShopFilter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>

					<Stack className="main-config" mb="76px">
						<Stack className="list-config">
							{products.length === 0 ? (
								<div className="no-data">
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No products found!</p>
								</div>
							) : (
								products.map((p) => (
									<ProductCard product={p} likeProductHandler={likeProductHandler} key={p._id} />
								))
							)}
						</Stack>

						<Stack className="pagination-config">
							{products.length > 0 && (
								<>
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
									<Stack className="total-result">
										<Typography>
											Total {total} product{total !== 1 ? 's' : ''} available
										</Typography>
									</Stack>
								</>
							)}
						</Stack>
					</Stack>
				</Stack>
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
		search: {
			pricesRange: { start: 0, end: 500 },
		},
	},
};

export default withLayoutBasic(ShopPage);
