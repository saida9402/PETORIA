import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, Divider, Stack, TablePagination, Typography } from '@mui/material';
import { List, ListItem } from '@mui/material';
import { TabContext } from '@mui/lab';
import { Plus } from 'phosphor-react';
import { useQuery, useMutation } from '@apollo/client';
import Swal from 'sweetalert2';
import { GET_NOTICES } from '../../../apollo/user/query';
import { CREATE_NOTICE } from '../../../apollo/admin/mutation';
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';
import NoticeFormModal from '../../../libs/components/NoticeFormModal';
import { NoticeStatus } from '../../../libs/types/notice/notice';

const LIMIT = 20;

const AdminNotice: NextPage = () => {
	const [tabValue, setTabValue] = useState<'all' | 'active' | 'hold' | 'deleted'>('all');
	const [page, setPage] = useState(0);
	const [createOpen, setCreateOpen] = useState(false);

	const buildSearch = () => {
		if (tabValue === 'active') return { noticeStatus: NoticeStatus.ACTIVE };
		if (tabValue === 'hold') return { noticeStatus: NoticeStatus.HOLD };
		if (tabValue === 'deleted') return { noticeStatus: NoticeStatus.DELETE };
		return {};
	};

	const { data, refetch } = useQuery(GET_NOTICES, {
		variables: { input: { page: page + 1, limit: LIMIT, search: buildSearch() } },
		fetchPolicy: 'network-only',
	});

	const [createNotice] = useMutation(CREATE_NOTICE);

	const noticesData = data?.getNotices?.list ?? [];
	const total = data?.getNotices?.metaCounter?.[0]?.total ?? 0;

	const handleCreate = async (input: any) => {
		await createNotice({ variables: { input } });
		Swal.fire({ icon: 'success', title: 'Notice created!', timer: 1500, showConfirmButton: false });
		refetch();
	};

	const handleTabChange = (value: 'all' | 'active' | 'hold' | 'deleted') => {
		setTabValue(value);
		setPage(0);
	};

	return (
		// @ts-ignore
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>Notice Management</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => setCreateOpen(true)}
				>
					<Plus size={18} style={{ marginRight: 8 }} />
					ADD
				</Button>
			</Box>

			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={tabValue}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{(['all', 'active', 'hold', 'deleted'] as const).map((t) => (
									<ListItem
										key={t}
										onClick={() => handleTabChange(t)}
										value={t}
										className={tabValue === t ? 'li on' : 'li'}
										sx={{ cursor: 'pointer' }}
									>
										{t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'all' ? total : noticesData.filter((n: any) => n.noticeStatus === t.toUpperCase()).length})
									</ListItem>
								))}
							</List>
							<Divider />
						</Box>

						<NoticeList noticesData={noticesData} refetch={refetch} />

						<TablePagination
							rowsPerPageOptions={[20, 40, 60]}
							component="div"
							count={total}
							rowsPerPage={LIMIT}
							page={page}
							onPageChange={(_, p) => setPage(p)}
							onRowsPerPageChange={() => {}}
						/>
					</TabContext>
				</Box>
			</Box>

			<NoticeFormModal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onSubmit={handleCreate}
				initialData={null}
			/>
		</Box>
	);
};

export default withAdminLayout(AdminNotice);
