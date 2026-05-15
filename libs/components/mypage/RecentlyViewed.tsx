import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';

import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import ShopProductCard from '../common/ShopProductCard (1)';

const RecentlyViewed: NextPage = () => {
	const device = useDeviceDetect();
	const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const {
		loading: getVisitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		onCompleted(data: T) {
			setRecentlyViewed(data.getVisited?.list);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	if (device === 'mobile') {
		return <div>PETORIA RECENTLY VIEWED MOBILE</div>;
	} else {
		return (
			<div id="recently-viewed-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Recently Viewed 👀</Typography>
						<Typography className="sub-title">Products you've browsed recently</Typography>
					</Stack>
				</Stack>

				<Stack className="favorites-list-box">
					{recentlyViewed?.length ? (
						recentlyViewed?.map((product: Product) => (
							<ShopProductCard key={product._id} product={product} recentlyViewed={true} />
						))
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No recently viewed products!</p>
						</div>
					)}
				</Stack>

				{recentlyViewed?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchVisited.limit)}
								page={searchVisited.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								{total} recently viewed product{total !== 1 ? 's' : ''}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default RecentlyViewed;
