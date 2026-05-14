import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberPhone
				memberImage
				memberAddress
				memberDesc
				memberLikes
				memberViews
				memberArticles
				memberPoints
				memberWarnings
				memberBlocks
				createdAt
				updatedAt
				accessToken
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

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				_id
				productType
				productStatus
				productCategory
				productName
				productPrice
				productImages
				productDesc
				productBrand
				productStock
				productSale
				productViews
				productLikes
				productComments
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
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

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
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
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
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
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         ORDER          *
 *************************/

export const GET_ALL_ORDERS = gql`
	query GetAllOrders {
		getAllOrders {
			_id
			memberId
			orderStatus
			orderTotal
			paymentMethod
			orderAddress
			orderNote
			cancelReason
			cancelledAt
			createdAt
			updatedAt
			orderItems {
				productId
				itemQuantity
				itemPrice
				itemStatus
			}
		}
	}
`;
