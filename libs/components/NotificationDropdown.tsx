import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Avatar, Badge, Box, Button, Divider, IconButton, Popover, Stack, Typography } from '@mui/material';
import { CheckCircle } from 'phosphor-react';
import { useReactiveVar, useMutation, useQuery } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { notificationsVar, unreadNotifCountVar } from '../../apollo/store';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../apollo/user/mutation';
import { Notification, NotificationStatus, NotificationGroup, NotificationType } from '../types/notification/notification';
import { API_URL } from '../config';

interface Props {
	anchorEl: HTMLElement | null;
	onClose: () => void;
}

const NotificationDropdown = ({ anchorEl, onClose }: Props) => {
	const router = useRouter();
	const notifications = useReactiveVar(notificationsVar);
	const open = Boolean(anchorEl);

	const { data } = useQuery(GET_MY_NOTIFICATIONS, {
		skip: !open,
		variables: { input: { page: 1, limit: 10, search: {} } },
		fetchPolicy: 'network-only',
	});

	// ─── PETORIA FIX START (GOAL 2) ───
	useEffect(() => {
		if (open) unreadNotifCountVar(0);
	}, [open]);
	// ─── PETORIA FIX END (GOAL 2) ───

	useEffect(() => {
		if (data?.getMyNotifications?.list) {
			// ─── PETORIA FIX START (GOAL 1) ───
			// Preserve notice items (isNotice: true) that arrived via WS —
			// they are not stored in the Notification collection and would be
			// lost if we simply overwrote the var with the GQL result.
			const existing = notificationsVar();
			const noticeItems = existing.filter((n: any) => n.isNotice);
			const gqlIds = new Set(data.getMyNotifications.list.map((n: any) => n._id?.toString()));
			const freshNotices = noticeItems.filter((n: any) => !gqlIds.has(n._id?.toString()));
			notificationsVar([...freshNotices, ...data.getMyNotifications.list] as any);
			// ─── PETORIA FIX END (GOAL 1) ───
		}
	}, [data]);

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

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
		onClose();
		router.push(getTargetPath(notif));
	};

	const handleMarkAll = async () => {
		notificationsVar(notificationsVar().map((n) => ({ ...n, notificationStatus: NotificationStatus.READ })));
		unreadNotifCountVar(0);
		await markAllRead();
	};

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}
		>
			<Box sx={{ p: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Typography sx={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15 }}>Notifications</Typography>
				{notifications.some((n) => n.notificationStatus === NotificationStatus.WAIT) && (
					<Button
						size="small"
						startIcon={<CheckCircle size={16} />}
						onClick={handleMarkAll}
						sx={{ color: '#33c1c1', textTransform: 'none', fontSize: 12, fontFamily: 'Nunito' }}
					>
						Mark all read
					</Button>
				)}
			</Box>
			<Divider />

			{notifications.length === 0 ? (
				<Box sx={{ py: 4, textAlign: 'center' }}>
					<Typography sx={{ color: '#aaa', fontFamily: 'Nunito', fontSize: 14 }}>No notifications yet</Typography>
				</Box>
			) : (
				<Stack sx={{ overflowY: 'auto', maxHeight: 360 }}>
					{notifications.map((notif) => {
						const isUnread = notif.notificationStatus === NotificationStatus.WAIT;
						const avatarSrc = notif.authorData?.memberImage
							? `${API_URL}/${notif.authorData.memberImage}`
							: '/img/profile/defaultUser.svg';

						if ((notif as any).isNotice || notif.notificationType === NotificationType.NOTICE) {
						return (
							<Box
								key={notif._id}
								sx={{
									display: 'flex',
									alignItems: 'flex-start',
									gap: '10px',
									p: '10px 16px',
									bgcolor: isUnread ? 'rgba(51,193,193,0.06)' : 'transparent',
									borderBottom: '1px solid rgba(0,0,0,0.05)',
								}}
							>
								<Typography sx={{ fontSize: 20, lineHeight: 1, mt: '2px' }}>📢</Typography>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										sx={{
											fontFamily: 'Nunito',
											fontSize: 13,
											fontWeight: isUnread ? 700 : 400,
											color: '#222',
											lineHeight: 1.4,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{notif.notificationTitle}
									</Typography>
									{notif.notificationDesc && (
										<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: '#888', mt: '2px' }}>
											{notif.notificationDesc}
										</Typography>
									)}
									<Typography sx={{ fontFamily: 'Nunito', fontSize: 11, color: '#bbb', mt: '4px' }}>
										{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
									</Typography>
								</Box>
							</Box>
						);
					}
					return (
							<Box
								key={notif._id}
								onClick={() => handleItemClick(notif)}
								sx={{
									display: 'flex',
									alignItems: 'flex-start',
									gap: '10px',
									p: '10px 16px',
									cursor: 'pointer',
									bgcolor: isUnread ? 'rgba(51,193,193,0.06)' : 'transparent',
									'&:hover': { bgcolor: 'rgba(51,193,193,0.10)' },
									borderBottom: '1px solid rgba(0,0,0,0.05)',
								}}
							>
								<Badge
									variant="dot"
									invisible={!isUnread}
									color="error"
									overlap="circular"
									anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
								>
									<Avatar src={avatarSrc} sx={{ width: 36, height: 36 }} />
								</Badge>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										sx={{
											fontFamily: 'Nunito',
											fontSize: 13,
											fontWeight: isUnread ? 700 : 400,
											color: '#222',
											lineHeight: 1.4,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{notif.notificationTitle}
									</Typography>
									{notif.notificationDesc && (
										<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: '#888', mt: '2px' }}>
											{notif.notificationDesc}
										</Typography>
									)}
									<Typography sx={{ fontFamily: 'Nunito', fontSize: 11, color: '#bbb', mt: '4px' }}>
										{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
									</Typography>
								</Box>
							</Box>
						);
					})}
				</Stack>
			)}

			<Divider />
			<Box sx={{ p: '8px 16px', textAlign: 'center' }}>
				<Button
					size="small"
					onClick={() => { onClose(); router.push('/notifications'); }}
					sx={{ color: '#33c1c1', textTransform: 'none', fontFamily: 'Nunito', fontSize: 13 }}
				>
					See all notifications
				</Button>
			</Box>
		</Popover>
	);
};

export default NotificationDropdown;
