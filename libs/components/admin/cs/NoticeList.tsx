import React, { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	Stack,
	Chip,
} from '@mui/material';
import { NotePencil, Trash } from 'phosphor-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { useMutation } from '@apollo/client';
import { DELETE_NOTICE, UPDATE_NOTICE } from '../../../../apollo/admin/mutation';
import { Notice, NoticeStatus } from '../../../types/notice/notice';
import NoticeFormModal from '../../NoticeFormModal';

interface NoticeListType {
	noticesData?: Notice[];
	refetch?: () => void;
}

const statusColor: Record<NoticeStatus, 'default' | 'success' | 'error'> = {
	[NoticeStatus.HOLD]: 'default',
	[NoticeStatus.ACTIVE]: 'success',
	[NoticeStatus.DELETE]: 'error',
};

export const NoticeList = ({ noticesData = [], refetch }: NoticeListType) => {
	const [editTarget, setEditTarget] = useState<Notice | null>(null);
	const [formOpen, setFormOpen] = useState(false);

	const [deleteNotice] = useMutation(DELETE_NOTICE);
	const [updateNotice] = useMutation(UPDATE_NOTICE);

	const handleDelete = async (noticeId: string) => {
		const result = await Swal.fire({
			title: 'Delete this notice?',
			text: 'This will soft-delete the notice.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#aaa',
			confirmButtonText: 'Delete',
		});
		if (!result.isConfirmed) return;
		await deleteNotice({ variables: { noticeId } });
		if (refetch) refetch();
	};

	const handleEdit = (notice: Notice) => {
		setEditTarget(notice);
		setFormOpen(true);
	};

	const handleSubmit = async (data: any) => {
		await updateNotice({ variables: { input: data } });
		if (refetch) refetch();
	};

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} size="medium">
					<TableHead>
						<TableRow>
							<TableCell align="left">CATEGORY</TableCell>
							<TableCell align="left">TITLE</TableCell>
							<TableCell align="left">STATUS</TableCell>
							<TableCell align="left">DATE</TableCell>
							<TableCell align="right">ACTION</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{noticesData.map((notice) => (
							<TableRow key={notice._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell align="left" sx={{ fontFamily: 'Nunito', fontSize: 13 }}>
									{notice.noticeCategory}
								</TableCell>
								<TableCell
									align="left"
									sx={{ fontFamily: 'Nunito', fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
								>
									{notice.noticeTitle}
								</TableCell>
								<TableCell align="left">
									<Chip
										label={notice.noticeStatus}
										color={statusColor[notice.noticeStatus]}
										size="small"
										sx={{ fontFamily: 'Nunito', fontSize: 11 }}
									/>
								</TableCell>
								<TableCell align="left" sx={{ fontFamily: 'Nunito', fontSize: 13, color: '#888' }}>
									{format(new Date(notice.createdAt), 'yyyy-MM-dd')}
								</TableCell>
								<TableCell align="right">
									<Tooltip title="Edit">
										<IconButton size="small" onClick={() => handleEdit(notice)}>
											<NotePencil size={20} weight="fill" />
										</IconButton>
									</Tooltip>
									<Tooltip title="Delete">
										<IconButton size="small" onClick={() => handleDelete(notice._id)}>
											<Trash size={18} />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<NoticeFormModal
				open={formOpen}
				onClose={() => { setFormOpen(false); setEditTarget(null); }}
				onSubmit={handleSubmit}
				initialData={editTarget}
			/>
		</Stack>
	);
};
