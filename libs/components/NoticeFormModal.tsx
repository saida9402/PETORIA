import React, { useEffect, useRef, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import Swal from 'sweetalert2';
import { Notice, NoticeCategory, NoticeInput, NoticeStatus, NoticeUpdate } from '../types/notice/notice';

interface Props {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: NoticeInput | NoticeUpdate) => Promise<void>;
	initialData?: Notice | null;
}

const NoticeFormModal = ({ open, onClose, onSubmit, initialData }: Props) => {
	const isEdit = Boolean(initialData);
	const contentRef = useRef<HTMLTextAreaElement>(null);

	const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>(NoticeCategory.FAQ);
	const [noticeStatus, setNoticeStatus] = useState<NoticeStatus>(NoticeStatus.HOLD);
	const [noticeTitle, setNoticeTitle] = useState('');
	const [noticeContent, setNoticeContent] = useState('');

	useEffect(() => {
		if (initialData) {
			setNoticeCategory(initialData.noticeCategory);
			setNoticeStatus(initialData.noticeStatus);
			setNoticeTitle(initialData.noticeTitle);
			setNoticeContent(initialData.noticeContent);
		} else {
			setNoticeCategory(NoticeCategory.FAQ);
			setNoticeStatus(NoticeStatus.HOLD);
			setNoticeTitle('');
			setNoticeContent('');
		}
	}, [initialData, open]);

	const handleSubmit = async () => {
		if (!noticeTitle.trim() || !noticeContent.trim()) {
			Swal.fire({ icon: 'warning', title: 'Please fill in title and content', timer: 2000, showConfirmButton: false });
			return;
		}

		const payload = isEdit && initialData
			? ({ _id: initialData._id, noticeCategory, noticeStatus, noticeTitle, noticeContent } as NoticeUpdate)
			: ({ noticeCategory, noticeStatus, noticeTitle, noticeContent } as NoticeInput);

		await onSubmit(payload);
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
			<DialogTitle sx={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 17 }}>
				{isEdit ? 'Edit Notice' : 'Create Notice'}
			</DialogTitle>
			<Divider />
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
					<FormControl fullWidth size="small">
						<InputLabel sx={{ fontFamily: 'Nunito' }}>Category</InputLabel>
						<Select
							value={noticeCategory}
							label="Category"
							onChange={(e) => setNoticeCategory(e.target.value as NoticeCategory)}
							sx={{ fontFamily: 'Nunito' }}
						>
							{Object.values(NoticeCategory).map((c) => (
								<MenuItem key={c} value={c} sx={{ fontFamily: 'Nunito' }}>
									{c}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl fullWidth size="small">
						<InputLabel sx={{ fontFamily: 'Nunito' }}>Status</InputLabel>
						<Select
							value={noticeStatus}
							label="Status"
							onChange={(e) => setNoticeStatus(e.target.value as NoticeStatus)}
							sx={{ fontFamily: 'Nunito' }}
						>
							{Object.values(NoticeStatus)
								.filter((s) => s !== NoticeStatus.DELETE)
								.map((s) => (
									<MenuItem key={s} value={s} sx={{ fontFamily: 'Nunito' }}>
										{s}
									</MenuItem>
								))}
						</Select>
					</FormControl>

					<TextField
						label="Title"
						value={noticeTitle}
						onChange={(e) => setNoticeTitle(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								contentRef.current?.focus();
							}
						}}
						fullWidth
						variant="outlined"
						size="small"
						inputProps={{ maxLength: 200 }}
						InputProps={{ notched: true, sx: { fontFamily: 'Nunito' } }}
						InputLabelProps={{ shrink: true, sx: { fontFamily: 'Nunito' } }}
					/>

					{/* Native textarea avoids MUI fieldset/legend pointer-event interception on multiline */}
					<Box>
						<Typography sx={{ fontFamily: 'Nunito', fontSize: 12, color: 'rgba(0,0,0,0.6)', mb: '4px' }}>
							Content
						</Typography>
						<textarea
							ref={contentRef}
							value={noticeContent}
							onChange={(e) => setNoticeContent(e.target.value)}
							maxLength={5000}
							rows={6}
							style={{
								width: '100%',
								fontFamily: 'Nunito',
								fontSize: '14px',
								padding: '8px 14px',
								border: '1px solid rgba(0,0,0,0.23)',
								borderRadius: '4px',
								outline: 'none',
								resize: 'vertical',
								boxSizing: 'border-box',
								lineHeight: 1.5,
								color: 'inherit',
								backgroundColor: 'transparent',
							}}
							onFocus={(e) => (e.target.style.borderColor = '#33c1c1')}
							onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.23)')}
						/>
					</Box>
				</Box>
			</DialogContent>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: '8px 20px 16px' }}>
				<Button
					onClick={onClose}
					sx={{ textTransform: 'none', fontFamily: 'Nunito', color: '#888' }}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					sx={{
						bgcolor: '#4E8A28',
						'&:hover': { bgcolor: '#3A6B1E' },
						textTransform: 'none',
						fontFamily: 'Nunito',
						borderRadius: 2,
					}}
				>
					{isEdit ? 'Update' : 'Create'}
				</Button>
			</Box>
		</Dialog>
	);
};

export default NoticeFormModal;
