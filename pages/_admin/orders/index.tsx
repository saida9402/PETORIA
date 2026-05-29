import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Chip,
	List,
	ListItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import { TabContext } from '@mui/lab';
import { useQuery } from '@apollo/client';
import { GET_ALL_ORDERS } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { OrderStatus } from '../../../libs/enums/order.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
	[OrderStatus.PENDING]:   'warning',
	[OrderStatus.PROCESS]:   'info',
	[OrderStatus.CONFIRM]:   'info',
	[OrderStatus.DELIVERED]: 'success',
	[OrderStatus.CANCEL]:    'error',
};

const AdminOrders: NextPage = () => {
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [orders, setOrders] = useState<any[]>([]);

	useQuery(GET_ALL_ORDERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getAllOrders ?? []);
		},
	});

	const displayed = statusFilter === 'ALL'
		? orders
		: orders.filter((o) => o.orderStatus === statusFilter);

	const tabs = ['ALL', ...Object.values(OrderStatus)];

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Order List
			</Typography>

			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={statusFilter}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{tabs.map((tab) => (
									<ListItem
										key={tab}
										onClick={() => setStatusFilter(tab)}
										className={statusFilter === tab ? 'li on' : 'li'}
									>
										{tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
									</ListItem>
								))}
							</List>
							<Divider />
						</Box>

						<TableContainer>
							<Table sx={{ minWidth: 900 }} aria-label="orders table">
								<TableHead>
									<TableRow>
										{['Order ID', 'Member ID', 'Items', 'Total ($)', 'Payment', 'Address', 'Status', 'Date'].map(
											(h) => (
												<TableCell key={h} sx={{ fontWeight: 700, background: '#F5F9F0' }}>
													{h}
												</TableCell>
											),
										)}
									</TableRow>
								</TableHead>
								<TableBody>
									{displayed.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} align="center" sx={{ py: 6, color: '#999' }}>
												No orders found.
											</TableCell>
										</TableRow>
									) : (
										displayed.map((order: any) => (
											<TableRow key={order._id} hover>
												<TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
													{order._id?.slice(-8)}
												</TableCell>
												<TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
													{order.memberId?.slice(-8)}
												</TableCell>
												<TableCell>{order.orderItems?.length ?? 0}</TableCell>
												<TableCell>${(order.orderTotal ?? 0).toFixed(2)}</TableCell>
												<TableCell sx={{ fontSize: 12 }}>{order.paymentMethod}</TableCell>
												<TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>
													{order.orderAddress}
												</TableCell>
												<TableCell>
													<Chip
														label={order.orderStatus}
														color={STATUS_COLOR[order.orderStatus] ?? 'default'}
														size="small"
														sx={{ fontWeight: 600, fontSize: 11 }}
													/>
												</TableCell>
												<TableCell sx={{ fontSize: 12 }}>
													{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(AdminOrders);
