import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Avatar, Badge, Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { CheckCircle } from 'phosphor-react';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { userVar, notificationsVar, unreadNotifCountVar } from '../../apollo/store';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../apollo/user/mutation';
import { Notification, NotificationStatus, NotificationGroup, NotificationType } from '../../libs/types/notification/notification';
import { API_URL } from '../../libs/config';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const NotificationsPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [authChecked, setAuthChecked] = useState(false);
	const [tab, setTab] = useState<'all' | 'unread' | 'LIKE' | 'COMMENT' | 'FOLLOW' | 'NOTICE'>('all');
	const [page, setPage] = useState(1);

	const limit = 20;

	const buildSearch = () => {
		const search: Record<string, string> = {};
		if (tab === 'unread') search['notificationStatus'] = NotificationStatus.WAIT;
		// Follow notifications are stored in the DB as notificationType LIKE with
		// notificationGroup MEMBER (backend bug in follow.service.ts). To fetch them
		// we must query for LIKE type and then separate client-side by group.
		if (tab === 'LIKE' || tab === 'FOLLOW') search['notificationType'] = 'LIKE';
		if (tab === 'COMMENT') search['notificationType'] = 'COMMENT';
		if (tab === 'NOTICE') search['notificationType'] = 'NOTICE';
		return search;
	};

	const applyTabFilter = (items: any[]): any[] => {
		if (tab === 'LIKE') {
			// Actual likes: LIKE type but NOT the MEMBER group (which are follows)
			return items.filter((n: any) => n.notificationGroup !== NotificationGroup.MEMBER);
		}
		if (tab === 'FOLLOW') {
			// Follows: LIKE type stored with MEMBER group
			return items.filter((n: any) => n.notificationGroup === NotificationGroup.MEMBER);
		}
		return items;
	};

	const { data, fetchMore } = useQuery(GET_MY_NOTIFICATIONS, {
		skip: !user._id,
		variables: { input: { page: 1, limit, search: buildSearch() } },
		fetchPolicy: 'network-only',
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	useEffect(() => {
		const id = setTimeout(() => setAuthChecked(true), 0);
		return () => clearTimeout(id);
	}, []);

	useEffect(() => {
		if (authChecked && !user._id) router.push('/').then();
	}, [authChecked, user._id]);

	const storeNotifs = useReactiveVar(notificationsVar);
	const noticeItems = storeNotifs.filter((n: any) => n.isNotice);
	const gqlList: Notification[] = data?.getMyNotifications?.list ?? [];
	const gqlIds = new Set(gqlList.map((n) => n._id?.toString()));
	const merged: any[] = [
		...noticeItems.filter((n: any) => !gqlIds.has(n._id?.toString())),
		...gqlList,
	].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const list: any[] = applyTabFilter(merged);
	const total: number = data?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;

	const getTargetPath = (notif: Notification): string => {
		switch (notif.notificationGroup) {
			case NotificationGroup.PRODUCT:
				return notif.productId ? `/shop/${notif.productId}` : '/shop';
			case NotificationGroup.ARTICLE:
				return notif.articleId ? `/community/detail?id=${notif.articleId}` : '/community';
			case NotificationGroup.MEMBER:
				return notif.authorId ? `/member?memberId=${notif.authorId}` : '/';
			default:
				return '/notifications';
		}
	};

	const handleItemClick = async (notif: Notification) => {
		if (notif.notificationStatus === NotificationStatus.WAIT) {
			notificationsVar(
				notificationsVar().map((n) =>
					n._id === notif._id ? { ...n, notificationStatus: NotificationStatus.READ } : n,
				),
			);
			unreadNotifCountVar(Math.max(0, unreadNotifCountVar() - 1));
			await markRead({ variables: { notificationId: notif._id } });
		}
		router.push(getTargetPath(notif));
	};

	const handleMarkAll = async () => {
		unreadNotifCountVar(0);
		await markAllRead();
	};

	const handleLoadMore = () => {
		const nextPage = page + 1;
		fetchMore({ variables: { input: { page: nextPage, limit, search: buildSearch() } } });
		setPage(nextPage);
	};

	return (
		<Stack className={'page-notifications'} sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 4 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
				<Typography sx={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22 }}>
					{t('NOTIFICATIONS') || 'Notifications'}
				</Typography>
				<Button
					size="small"
					startIcon={<CheckCircle size={20} />}
					onClick={handleMarkAll}
					sx={{ color: '#33c1c1', textTransform: 'none', fontFamily: 'Nunito' }}
				>
					{t('MARK_ALL_READ') || 'Mark all as read'}
				</Button>
			</Box>

			<Tabs
				value={tab}
				onChange={(_, v) => { setTab(v); setPage(1); }}
				textColor="inherit"
				TabIndicatorProps={{ style: { backgroundColor: '#33c1c1' } }}
				sx={{ mb: 2, borderBottom: '1px solid #eee' }}
			>
				<Tab label="All" value="all" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
				<Tab label="Unread" value="unread" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
				<Tab label="Likes" value="LIKE" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
				<Tab label="Comments" value="COMMENT" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
				<Tab label="Follows" value="FOLLOW" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
				<Tab label="Notices" value="NOTICE" sx={{ fontFamily: 'Nunito', textTransform: 'none' }} />
			</Tabs>

			{list.length === 0 ? (
				<Box sx={{ py: 8, textAlign: 'center' }}>
					<Typography sx={{ color: '#aaa', fontFamily: 'Nunito', fontSize: 15 }}>
						{t('NO_NOTIFICATIONS') || 'No notifications yet'}
					</Typography>
				</Box>
			) : (
				<Stack>
					{list.map((notif) => {
						const isUnread = notif.notificationStatus === NotificationStatus.WAIT;
						const avatarSrc = notif.authorData?.memberImage
							? `${API_URL}/${notif.authorData.memberImage}`
							: '/img/profile/defaultUser.svg';

						if ((notif as any).isNotice || notif.notificationType === NotificationType.NOTICE) {
							return (
								<Box key={notif._id}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											gap: '12px',
											p: '14px 0',
											bgcolor: isUnread ? 'rgba(51,193,193,0.05)' : 'transparent',
											borderRadius: 1,
											px: 1,
										}}
									>
										<Typography sx={{ fontSize: 24, lineHeight: 1, mt: '2px' }}>📢</Typography>
										<Box sx={{ flex: 1 }}>
											<Typography
												sx={{
													fontFamily: 'Nunito',
													fontSize: 14,
													fontWeight: isUnread ? 700 : 400,
													color: '#222',
													lineHeight: 1.5,
												}}
											>
												{notif.notificationTitle}
											</Typography>
											{notif.notificationDesc && (
												<Typography sx={{ fontFamily: 'Nunito', fontSize: 13, color: '#888', mt: '2px' }}>
													{notif.notificationDesc}
												</Typography>
											)}
											<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: '#bbb', mt: '4px' }}>
												{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
											</Typography>
										</Box>
									</Box>
									<Divider />
								</Box>
							);
						}

						if (notif.notificationType === NotificationType.FOLLOW) {
							return (
								<Box key={notif._id}>
									<Box
										onClick={() => handleItemClick(notif)}
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											gap: '12px',
											p: '14px 0',
											cursor: 'pointer',
											bgcolor: isUnread ? 'rgba(51,193,193,0.05)' : 'transparent',
											'&:hover': { bgcolor: 'rgba(51,193,193,0.08)' },
											borderRadius: 1,
											px: 1,
										}}
									>
										<Badge
											variant="dot"
											invisible={!isUnread}
											color="error"
											overlap="circular"
											anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
										>
											<Avatar src={avatarSrc} sx={{ width: 42, height: 42 }} />
										</Badge>
										<Box sx={{ flex: 1 }}>
											<Typography sx={{ fontFamily: 'Nunito', fontSize: 14, fontWeight: isUnread ? 700 : 400, color: '#222', lineHeight: 1.5 }}>
												{notif.notificationTitle}
											</Typography>
											{notif.notificationDesc && (
												<Typography sx={{ fontFamily: 'Nunito', fontSize: 13, color: '#888', mt: '2px' }}>
													{notif.notificationDesc}
												</Typography>
											)}
											<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: '#bbb', mt: '4px' }}>
												{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
											</Typography>
										</Box>
									</Box>
									<Divider />
								</Box>
							);
						}

						return (
							<Box key={notif._id}>
								<Box
									onClick={() => handleItemClick(notif)}
									sx={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: '12px',
										p: '14px 0',
										cursor: 'pointer',
										bgcolor: isUnread ? 'rgba(51,193,193,0.05)' : 'transparent',
										'&:hover': { bgcolor: 'rgba(51,193,193,0.08)' },
										borderRadius: 1,
										px: 1,
									}}
								>
									<Badge
										variant="dot"
										invisible={!isUnread}
										color="error"
										overlap="circular"
										anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
									>
										<Avatar src={avatarSrc} sx={{ width: 42, height: 42 }} />
									</Badge>
									<Box sx={{ flex: 1 }}>
										<Typography
											sx={{
												fontFamily: 'Nunito',
												fontSize: 14,
												fontWeight: isUnread ? 700 : 400,
												color: '#222',
												lineHeight: 1.5,
											}}
										>
											{notif.notificationTitle}
										</Typography>
										{notif.notificationDesc && (
											<Typography sx={{ fontFamily: 'Nunito', fontSize: 13, color: '#888', mt: '2px' }}>
												{notif.notificationDesc}
											</Typography>
										)}
										<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: '#bbb', mt: '4px' }}>
											{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
										</Typography>
									</Box>
								</Box>
								<Divider />
							</Box>
						);
					})}
				</Stack>
			)}

			{list.length < total && (
				<Box sx={{ textAlign: 'center', mt: 3 }}>
					<Button
						variant="outlined"
						onClick={handleLoadMore}
						sx={{ borderColor: '#33c1c1', color: '#33c1c1', fontFamily: 'Nunito', textTransform: 'none', borderRadius: 2 }}
					>
						Load more
					</Button>
				</Box>
			)}
		</Stack>
	);
};

export default withLayoutBasic(NotificationsPage);
