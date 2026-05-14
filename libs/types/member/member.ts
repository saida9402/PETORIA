import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface MeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage: string;
	memberAddress?: string;
	memberDesc?: string;
	memberProducts: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}
