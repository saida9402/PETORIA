import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const LOGOUT = gql`
	mutation Logout {
		logout
	}
`;

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
			memberPoints
			memberLikes
			memberViews
			memberFollowings
			memberFollowers
			memberRank
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
			memberPoints
			memberLikes
			memberViews
			memberFollowings
			memberFollowers
			memberRank
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberPoints
			memberLikes
			memberViews
			memberFollowings
			memberFollowers
			memberRank
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($memberId: String!) {
		likeTargetMember(memberId: $memberId) {
			_id
			memberLikes
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const IMAGE_UPLOADER = gql`
	mutation ImageUploader($file: Upload!, $target: String!) {
		imageUploader(file: $file, target: $target)
	}
`;

export const IMAGES_UPLOADER = gql`
	mutation ImagesUploader($files: [Upload!]!, $target: String!) {
		imagesUploader(files: $files, target: $target)
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productType
			productStatus
			productCategory
			productName
			productBrand
			productSize
			productPrice
			productStock
			productImages
			productDesc
			productSale
			productSalePercent
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productType
			productStatus
			productCategory
			productName
			productBrand
			productSize
			productPrice
			productStock
			productImages
			productDesc
			productSale
			productSalePercent
			soldAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(input: $input) {
			_id
			productLikes
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
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
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($articleId: String!) {
		likeTargetBoardArticle(articleId: $articleId) {
			_id
			articleLikes
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *        COMMENT         *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *          ORDER         *
 *************************/

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: OrderInput!) {
		createOrder(input: $input) {
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
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder($input: OrderUpdateInput!) {
		updateOrder(input: $input) {
			_id
			orderStatus
			orderItems {
				_id
				itemStatus
			}
			updatedAt
		}
	}
`;

export const UPDATE_MY_ORDER_STATUS = gql`
	mutation UpdateMyOrderStatus($input: OrderUpdateInput!) {
		updateMyOrderStatus(input: $input) {
			_id
			orderStatus
			memberId
			orderTotal
			orderItems {
				_id
				itemQuantity
				itemPrice
			}
			paymentMethod
			orderAddress
			createdAt
		}
	}
`;

export const CANCEL_ORDER = gql`
	mutation CancelOrder($input: OrderCancelInput!) {
		cancelOrder(input: $input) {
			_id
			orderStatus
			cancelReason
			cancelledAt
			updatedAt
		}
	}
`;
