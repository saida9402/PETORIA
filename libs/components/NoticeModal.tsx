import React, { useEffect } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { format } from 'date-fns';
import { activeNoticeVar } from '../../apollo/store';

const NoticeModal = () => {
	const notice = useReactiveVar(activeNoticeVar);

	// ─── PETORIA FIX START ───
	useEffect(() => {
		if (!notice) return;
		const today = format(new Date(), 'yyyy-MM-dd');
		const key = `notice_dismissed_${notice._id}_${today}`;
		if (localStorage.getItem(key)) {
			activeNoticeVar(null);
		}
	}, [notice]);
	// ─── PETORIA FIX END ───

	if (!notice) return null;

	const handleClose = () => activeNoticeVar(null);

	const handleDismissToday = () => {
		const today = format(new Date(), 'yyyy-MM-dd');
		localStorage.setItem(`notice_dismissed_${notice._id}_${today}`, '1');
		activeNoticeVar(null);
	};

	return (
		<Dialog
			open={true}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
		>
			<DialogTitle sx={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 18, color: '#222', pb: 0 }}>
				📢 {notice.noticeTitle}
			</DialogTitle>
			<Divider sx={{ my: 1 }} />
			<DialogContent sx={{ pt: 1 }}>
				<Typography
					sx={{ fontFamily: 'Nunito', fontSize: 14, color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
					dangerouslySetInnerHTML={{ __html: notice.noticeContent }}
				/>
			</DialogContent>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: '8px 16px 12px' }}>
				<Button
					size="small"
					onClick={handleDismissToday}
					sx={{ color: '#aaa', textTransform: 'none', fontFamily: 'Nunito', fontSize: 13 }}
				>
					Don't show today
				</Button>
				<Button
					size="small"
					variant="contained"
					onClick={handleClose}
					sx={{
						bgcolor: '#33c1c1',
						'&:hover': { bgcolor: '#2aa8a8' },
						textTransform: 'none',
						fontFamily: 'Nunito',
						fontSize: 13,
						borderRadius: 2,
					}}
				>
					Close
				</Button>
			</Box>
		</Dialog>
	);
};

export default NoticeModal;
