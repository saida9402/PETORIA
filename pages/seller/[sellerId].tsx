import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Typography, Pagination, Box, Chip, Avatar, Button } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER, GET_PRODUCTS, GET_COMMENTS } from '../../apollo/user/query';
import {
	SUBSCRIBE,
	UNSUBSCRIBE,
	LIKE_TARGET_PRODUCT,
	CREATE_COMMENT,
} from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { API_URL, Messages } from '../../libs/config';
import { Product } from '../../libs/types/product/product';
import { Member } from '../../libs/types/member/member';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ShopProductCard from '../../libs/components/common/ShopProductCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export const getStaticPaths = async () => ({
	paths: [],
	fallback: 'blocking',
});

const SellerStorePage: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const router = useRouter();
	const { sellerId } = router.query;
	const user = useReactiveVar(userVar);

	const [seller, setSeller] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
	const [productTotal, setProductTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [sellerComments, setSellerComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { data: getMemberData, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: sellerId },
		skip: !sellerId,
		onCompleted: (data: T) => {
			const m: Member = data?.getMember;
			setSeller(m);
			setSearchFilter((prev) => ({ ...prev, search: { memberId: m?._id } }));
			setCommentInquiry((prev) => ({ ...prev, search: { commentRefId: m?._id } }));
			setInsertCommentData((prev) => ({ ...prev, commentRefId: m?._id }));
		},
	});

	useEffect(() => {
		if (getMemberData?.getMember) {
			setSeller(getMemberData.getMember);
		}
	}, [getMemberData]);

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSellerProducts(data?.getProducts?.list ?? []);
			setProductTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSellerComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchFilter.search.memberId) getProductsRefetch({ input: searchFilter });
	}, [searchFilter]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) getCommentsRefetch({ input: commentInquiry });
	}, [commentInquiry]);

	/** HANDLERS **/
	const productPaginationHandler = async (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter((prev) => ({ ...prev, page: value }));
	};

	const commentPaginationHandler = async (_: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const followHandler = async () => {
		if (!user._id) { sweetErrorHandling(new Error(Messages.error2)).then(); return; }
		if (!seller?._id) return;
		const wasFollowing = seller.meFollowed?.[0]?.myFollowing ?? false;
		// Optimistic update — instant UI feedback
		setSeller((prev) =>
			prev ? { ...prev, meFollowed: [{ followingId: prev._id, followerId: user._id, myFollowing: !wasFollowing }] } : prev,
		);
		try {
			if (wasFollowing) {
				await unsubscribe({ variables: { input: seller._id } });
			} else {
				await subscribe({ variables: { input: seller._id } });
			}
			await sweetTopSmallSuccessAlert('Done!', 800);
			getMemberRefetch({ input: sellerId });
		} catch (err: any) {
			// Revert optimistic update on failure
			setSeller((prev) =>
				prev ? { ...prev, meFollowed: [{ followingId: prev._id, followerId: user._id, myFollowing: wasFollowing }] } : prev,
			);
			sweetErrorHandling(err).then();
		}
	};

	const likeProductHandler = async (id: string) => {
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

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === seller?._id) throw new Error('Cannot review yourself');
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const avatarSrc = seller?.memberImage ? `${API_URL}/${seller.memberImage}` : '/img/profile/defaultUser.svg';
	const isFollowing = seller?.meFollowed?.[0]?.myFollowing ?? false;

	return (
		<div id="seller-store-page">
			<div className="container">
				{/* ── Banner + Profile Header ── */}
				<div className="ssp-header">
					<div className="ssp-banner" />
					<div className="ssp-profile-row">
						<div className="ssp-avatar-wrap">
							<Avatar src={avatarSrc} className="ssp-avatar" />
							<Chip
								icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
								label="Verified Seller"
								size="small"
								className="ssp-verified-badge"
							/>
						</div>
						<div className="ssp-meta">
							<Typography className="ssp-name">{seller?.memberFullName ?? seller?.memberNick ?? '—'}</Typography>
							<Typography className="ssp-nick">@{seller?.memberNick}</Typography>
							{seller?.memberDesc && <Typography className="ssp-desc">{seller.memberDesc}</Typography>}
							{seller?.memberAddress && (
								<Typography className="ssp-address">📍 {seller.memberAddress}</Typography>
							)}
						</div>
						<div className="ssp-right">
							{/* Stats */}
							<div className="ssp-stats">
								<div className="ssp-stat">
									<Inventory2Icon className="ssp-stat__icon" />
									<span className="ssp-stat__value">{seller?.memberProducts ?? 0}</span>
									<span className="ssp-stat__label">Products</span>
								</div>
								<div className="ssp-stat">
									<FavoriteIcon className="ssp-stat__icon" />
									<span className="ssp-stat__value">{seller?.memberLikes ?? 0}</span>
									<span className="ssp-stat__label">Likes</span>
								</div>
								<div className="ssp-stat">
									<RemoveRedEyeIcon className="ssp-stat__icon" />
									<span className="ssp-stat__value">{seller?.memberViews ?? 0}</span>
									<span className="ssp-stat__label">Views</span>
								</div>
								<div className="ssp-stat">
									<GroupIcon className="ssp-stat__icon" />
									<span className="ssp-stat__value">{seller?.memberFollowers ?? 0}</span>
									<span className="ssp-stat__label">Followers</span>
								</div>
							</div>
							{/* Follow Button */}
							{user._id && user._id !== seller?._id && (
								<Button
									className={`ssp-follow-btn ${isFollowing ? 'ssp-follow-btn--active' : ''}`}
									onClick={followHandler}
								>
									{isFollowing ? '✓ Following' : '+ Follow Store'}
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* ── Products Grid ── */}
				<div className="ssp-section">
					<Typography className="ssp-section__title">
						🛍 Products
						<span className="ssp-section__count">{productTotal}</span>
					</Typography>

					{sellerProducts.length === 0 ? (
						<div className="no-data">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No products yet.</p>
						</div>
					) : (
						<div className="ssp-product-grid">
							{sellerProducts.map((product: Product) => (
								<ShopProductCard
									key={product._id}
									product={product}
									likeProductHandler={likeProductHandler}
								/>
							))}
						</div>
					)}

					{productTotal > searchFilter.limit && (
						<Stack className="ssp-pagination">
							<Pagination
								count={Math.ceil(productTotal / searchFilter.limit)}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={productPaginationHandler}
							/>
						</Stack>
					)}
				</div>

				{/* ── Reviews ── */}
				<div className="ssp-section">
					<Typography className="ssp-section__title">
						⭐ Reviews
						<span className="ssp-section__count">{commentTotal}</span>
					</Typography>

					{commentTotal > 0 && (
						<div className="ssp-reviews">
							<Box component="div" className="ssp-reviews__header">
								<StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
								<span>{commentTotal} review{commentTotal > 1 ? 's' : ''}</span>
							</Box>
							{sellerComments.map((comment: Comment) => (
								<ReviewCard comment={comment} key={comment._id} />
							))}
							{commentTotal > commentInquiry.limit && (
								<Stack className="ssp-pagination">
									<Pagination
										count={Math.ceil(commentTotal / commentInquiry.limit)}
										page={commentInquiry.page}
										shape="circular"
										color="primary"
										onChange={commentPaginationHandler}
									/>
								</Stack>
							)}
						</div>
					)}

					<div className="ssp-leave-review">
						<Typography className="ssp-leave-review__title">Leave a Review</Typography>
						<textarea
							className="ssp-leave-review__textarea"
							rows={4}
							placeholder="Share your experience with this seller..."
							value={insertCommentData.commentContent}
							onChange={({ target: { value } }) =>
								setInsertCommentData((prev) => ({ ...prev, commentContent: value }))
							}
						/>
						<Button
							className="ssp-leave-review__submit"
							disabled={!insertCommentData.commentContent || !user._id}
							onClick={createCommentHandler}
						>
							Submit Review
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

SellerStorePage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: { memberId: '' },
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(SellerStorePage);
