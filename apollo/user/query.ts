import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql`
	query GetMember($input: String!) {
		getMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberFollowings
			memberFollowers
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
			meFollowed {
				followingId
				followerId
				myFollowing
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_SELLERS = gql`
	query GetSeller($input: SellersInquiry!) {
		getSeller(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberProducts
				memberPoints
				memberLikes
				memberViews
				memberFollowings
				memberFollowers
				memberRank
				createdAt
				updatedAt
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const GET_PRODUCT = gql`
	query GetProduct($productId: String!) {
		getProduct(productId: $productId) {
			_id
			productType
			productStatus
			productCategory
			productName
			productBrand
			productSize
			productPrice
			productStock
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			productSale
			productSalePercent
			memberId
			soldAt
			deletedAt
			manufacturedAt
			createdAt
			updatedAt
			memberData {
				_id
				memberNick
				memberImage
				memberType
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				_id
				productType
				productStatus
				productCategory
				productName
				productBrand
				productSize
				productPrice
				productStock
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				productSale
				productSalePercent
				memberId
				soldAt
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SELLER_PRODUCTS = gql`
	query GetSellerProducts($input: SellerProductsInquiry!) {
		getSellerProducts(input: $input) {
			list {
				_id
				productType
				productStatus
				productCategory
				productName
				productBrand
				productSize
				productPrice
				productStock
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				productSale
				productSalePercent
				memberId
				soldAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        COMMENT         *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
					memberFollowers
					memberFollowings
					memberPoints
					memberLikes
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followerData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
					memberFollowers
					memberFollowings
					memberPoints
					memberLikes
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *          ORDER         *
 *************************/

export const GET_MY_ORDERS = gql`
	query GetMyOrders {
		getMyOrders {
			_id
			memberId
			orderItems {
				_id
				productId
				itemQuantity
				itemPrice
				itemStatus
			}
			orderTotal
			orderStatus
			paymentMethod
			orderAddress
			orderNote
			cancelReason
			cancelledAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *       FAVORITES        *
 *************************/

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				productType
				productStatus
				productCategory
				productName
				productBrand
				productSize
				productPrice
				productStock
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				productSale
				productSalePercent
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *    RECENTLY VISITED    *
 *************************/

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				productType
				productStatus
				productCategory
				productName
				productBrand
				productSize
				productPrice
				productStock
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				productSale
				productSalePercent
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
