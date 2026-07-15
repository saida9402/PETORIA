import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, Divider, TablePagination, Typography } from '@mui/material';
import { List, ListItem } from '@mui/material';
import { TabContext } from '@mui/lab';
import { Plus } from 'phosphor-react';
import { useQuery, useMutation } from '@apollo/client';
import Swal from 'sweetalert2';
import { GET_NOTICES } from '../../../apollo/user/query';
import { CREATE_NOTICE } from '../../../apollo/admin/mutation';
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';
import NoticeFormModal from '../../../libs/components/NoticeFormModal';
import { NoticeCategory, NoticeStatus } from '../../../libs/types/notice/notice';

const LIMIT = 20;

// FAQs are Notice records with noticeCategory === FAQ, so this page reuses the
// Notice GraphQL + list + form, scoped to the FAQ category. Mirrors notice.tsx.
const statusForTab: Record<'active' | 'hold' | 'deleted', NoticeStatus> = {
	active: NoticeStatus.ACTIVE,
	hold: NoticeStatus.HOLD,
	deleted: NoticeStatus.DELETE,
};

const AdminFaq: NextPage = () => {
	const [tabValue, setTabValue] = useState<'all' | 'active' | 'hold' | 'deleted'>('all');
	const [page, setPage] = useState(0);
	const [createOpen, setCreateOpen] = useState(false);

	const buildSearch = () => {
		const search: { noticeCategory: NoticeCategory; noticeStatus?: NoticeStatus } = {
			noticeCategory: NoticeCategory.FAQ,
		};
		if (tabValue !== 'all') search.noticeStatus = statusForTab[tabValue];
		return search;
	};

	const { data, refetch } = useQuery(GET_NOTICES, {
		variables: { input: { page: page + 1, limit: LIMIT, search: buildSearch() } },
		fetchPolicy: 'network-only',
	});

	const [createNotice] = useMutation(CREATE_NOTICE);

	const faqData = data?.getNotices?.list ?? [];
	const total = data?.getNotices?.metaCounter?.[0]?.total ?? 0;

	const handleCreate = async (input: any) => {
		// Force FAQ category so the new entry belongs to this list regardless of the shared modal.
		await createNotice({ variables: { input: { ...input, noticeCategory: NoticeCategory.FAQ } } });
		Swal.fire({ icon: 'success', title: 'FAQ created!', timer: 1500, showConfirmButton: false });
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
				<Typography variant={'h2'}>FAQ Management</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => setCreateOpen(true)}
					sx={{
						bgcolor: '#4E8A28',
						'&:hover': { bgcolor: '#3A6B1E' },
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: 2,
						gap: 0.5,
					}}
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
										{t.charAt(0).toUpperCase() + t.slice(1)} (
										{t === 'all' ? total : faqData.filter((n: any) => n.noticeStatus === statusForTab[t]).length})
									</ListItem>
								))}
							</List>
							<Divider />
						</Box>

						<NoticeList noticesData={faqData} refetch={refetch} />

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

export default withAdminLayout(AdminFaq);
