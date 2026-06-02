import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';

import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_VISITED } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import ShopProductCard from '../common/ShopProductCard';

const RecentlyViewed: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		data: getVisitedData,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setRecentlyViewed(data.getVisited?.list);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	// Apollo Client 3: onCompleted does not fire on refetch(), so sync state
	// via useEffect whenever the query data changes (initial fetch or refetch).
	useEffect(() => {
		if (getVisitedData) {
			setRecentlyViewed(getVisitedData.getVisited?.list ?? []);
			setTotal(getVisitedData.getVisited?.metaCounter?.[0]?.total ?? 0);
		}
	}, [getVisitedData]);

	// Prevents the like handler from firing twice for the same product
	const likeInProgressRef = useRef<string | null>(null);

	/** HANDLERS **/
	const likeProductHandler = async (id: string) => {
		console.log('LIKE CLICKED', id);
		if (likeInProgressRef.current === id) return;
		likeInProgressRef.current = id;
		try {
			if (!id) return;
			if (!user._id) {
				sweetMixinErrorAlert('Please log in to like products').then();
				return;
			}
			await likeTargetProduct({ variables: { input: id } });
			await getVisitedRefetch({ input: searchVisited });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			likeInProgressRef.current = null;
		}
	};

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
						<Typography className="sub-title">
							{total > 0
								? `${total} product${total !== 1 ? 's' : ''} viewed recently`
								: "Products you've browsed recently"}
						</Typography>
					</Stack>
				</Stack>

				<Stack className="favorites-list-box">
					{recentlyViewed?.length ? (
						recentlyViewed.map((product: Product) => {
							console.log('RENDERING CARD', product._id, 'likeHandler:', !!likeProductHandler);
							return (
								<ShopProductCard
									key={product._id}
									product={product}
									likeProductHandler={likeProductHandler}
									recentlyViewed={true}
								/>
							);
						})
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
					</Stack>
				) : null}
			</div>
		);
	}
};

export default RecentlyViewed;
