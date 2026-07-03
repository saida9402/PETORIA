import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import type { Notification } from '../libs/types/notification/notification';
import type { Notice } from '../libs/types/notice/notice';
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
	memberProducts: 0,
};

export const userVar = makeVar<CustomJwtPayload>(initDomain);

//@ts-ignore
export const socketVar = makeVar<WebSocket>();

// ─── PETORIA WEBSOCKET ADDITION START ───
// ─── PETORIA FIX START (BUG 3) ───
export const chatMessagesVar = makeVar<any[]>([]);
// ─── PETORIA FIX END (BUG 3) ───
export const notificationsVar = makeVar<Notification[]>([]);
export const unreadNotifCountVar = makeVar<number>(0);
export const noticesVar = makeVar<Notice[]>([]);
export const activeNoticeVar = makeVar<Notice | null>(null);
// ─── PETORIA WEBSOCKET ADDITION END ───
