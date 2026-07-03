import { Member } from '../member/member';

export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation */
	memberData?: Member;
}

export interface Notices {
	list: Notice[];
	metaCounter: { total: number }[];
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	search: {
		noticeCategory?: NoticeCategory;
		noticeStatus?: NoticeStatus;
	};
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}
