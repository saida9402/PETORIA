import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export { themeVar } from '../libs/store/themeStore';
export const chatOpenVar = makeVar(false);
export const onlineUsersVar = makeVar(0);
export const unreadMsgCountVar = makeVar(0);

export const initDomain: CustomJwtPayload = {
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
};

export const userVar = makeVar<CustomJwtPayload>(initDomain);

//@ts-ignore
export const socketVar = makeVar<WebSocket>();
