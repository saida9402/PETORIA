import { Member } from '../member/member';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	NOTICE = 'NOTICE',
}

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PRODUCT = 'PRODUCT',
	SYSTEM = 'SYSTEM',
}

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	productId?: string;
	articleId?: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation */
	authorData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: { total: number }[];
}

export interface NotificationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: number;
	search: {
		notificationStatus?: NotificationStatus;
		notificationType?: NotificationType;
	};
}
