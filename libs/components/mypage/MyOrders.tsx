import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { CANCEL_ORDER } from '../../../apollo/user/mutation';
import { Order, OrderItem } from '../../types/order/order';
import { OrderStatus } from '../../enums/order.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import PaymentModal from './PaymentModal';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
	[OrderStatus.PENDING]:   { label: 'Pending',   color: '#92400e', bg: '#fef3c7' },
	[OrderStatus.PROCESS]:   { label: 'In Transit', color: '#1e40af', bg: '#dbeafe' },
	[OrderStatus.CONFIRM]:   { label: 'Confirmed',  color: '#065f46', bg: '#d1fae5' },
	[OrderStatus.DELIVERED]: { label: 'Delivered',  color: '#14532d', bg: '#bbf7d0' },
	[OrderStatus.CANCEL]:    { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2' },
};

const TRACK_STEPS = ['Ordered', 'Packed', 'Shipped', 'Delivered'];
const STEP_FOR_STATUS: Partial<Record<OrderStatus, number>> = {
	[OrderStatus.PENDING]:   0,
	[OrderStatus.PROCESS]:   2,
	[OrderStatus.CONFIRM]:   1,
	[OrderStatus.DELIVERED]: 3,
};

const STATUS_FILTERS = [
	{ label: 'All',        value: '' },
	{ label: 'Pending',    value: OrderStatus.PENDING },
	{ label: 'In Transit', value: OrderStatus.PROCESS },
	{ label: 'Delivered',  value: OrderStatus.DELIVERED },
	{ label: 'Cancelled',  value: OrderStatus.CANCEL },
];

const PAYMENT_LABELS: Record<string, string> = {
	CREDIT_CARD:   'Credit Card',
	DEBIT_CARD:    'Debit Card',
	CASH:          'Cash',
	PAYPAL:        'PayPal',
	STRIPE:        'Stripe',
	APPLE_PAY:     'Apple Pay',
	GOOGLE_PAY:    'Google Pay',
	BANK_TRANSFER: 'Bank Transfer',
};

export default function MyOrders() {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [filter, setFilter] = useState<string>('');
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	const { data, loading, refetch } = useQuery(GET_MY_ORDERS, {
		skip: !user._id,
		fetchPolicy: 'cache-and-network',
	});

	const [cancelOrder] = useMutation(CANCEL_ORDER);

	// Auto-open PaymentModal for the newest PENDING order when arriving from checkout
	useEffect(() => {
		if (loading || router.query.pay !== 'latest') return;
		const orders: Order[] = data?.getMyOrders ?? [];
		const firstPending = orders.find((o) => o.orderStatus === OrderStatus.PENDING);
		if (firstPending) {
			setSelectedOrder(firstPending);
			router.replace('/mypage?category=myOrders', undefined, { shallow: true });
		}
	}, [loading, data, router.query.pay]);

	const orders: Order[] = data?.getMyOrders ?? [];
	const filtered = filter ? orders.filter((o) => o.orderStatus === filter) : orders;

	const handleCancel = async (orderId: string) => {
		const yes = await sweetConfirmAlert('Cancel this order?');
		if (!yes) return;
		try {
			setCancellingId(orderId);
			await cancelOrder({ variables: { input: { orderId, cancelReason: 'Cancelled by customer' } } });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
			refetch();
		} catch (err) {
			sweetErrorHandling(err).then();
		} finally {
			setCancellingId(null);
		}
	};

	if (loading) {
		return (
			<div className="my-orders__loading">
				{[1, 2, 3].map((i) => (
					<div key={i} className="order-card order-card--skeleton" />
				))}
			</div>
		);
	}

	return (
		<div className="my-orders">
			<div className="my-orders__header">
				<h2 className="my-orders__title">My Orders</h2>
				<p className="my-orders__sub">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
			</div>

			{/* Filter chips */}
			<div className="my-orders__filters">
				{STATUS_FILTERS.map((f) => (
					<button
						key={f.value}
						className={`order-filter-chip${filter === f.value ? ' order-filter-chip--active' : ''}`}
						onClick={() => setFilter(f.value)}
					>
						{f.label}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className="my-orders__empty">
					<span className="my-orders__empty-icon">📦</span>
					<p>No orders found</p>
					<Link href="/shop" className="btn btn--primary btn--sm">Start shopping →</Link>
				</div>
			) : (
				<div className="my-orders__list">
					{filtered.map((order) => {
						const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG[OrderStatus.PENDING];
						const stepIndex = STEP_FOR_STATUS[order.orderStatus] ?? 0;
						const isActive = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.PROCESS;
						const isDelivered = order.orderStatus === OrderStatus.DELIVERED;
						const isCancelled = order.orderStatus === OrderStatus.CANCEL;

						return (
							<div key={order._id} className={`order-card${isCancelled ? ' order-card--cancelled' : ''}`}>
								{/* Order header */}
								<div className="order-card__head">
									<div className="order-card__id-row">
										<span className="order-card__label">Order</span>
										<span className="order-card__id">#{order._id.slice(-8).toUpperCase()}</span>
									</div>
									<span
										className="order-card__status-badge"
										style={{ color: cfg.color, background: cfg.bg }}
									>
										{cfg.label}
									</span>
								</div>

								{/* Order meta */}
								<div className="order-card__meta">
									<span>📅 {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
									<span>💳 {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
									{order.orderAddress && <span>📍 {order.orderAddress}</span>}
								</div>

								{/* Items */}
								<div className="order-card__items">
									{order.orderItems.map((item: OrderItem) => (
										<div key={item._id} className="order-item">
											<span className="order-item__icon">🛍️</span>
											<span className="order-item__qty">× {item.itemQuantity}</span>
											<span className="order-item__price">${(item.itemPrice * item.itemQuantity).toFixed(2)}</span>
										</div>
									))}
								</div>

								{/* Tracking bar (only for active orders) */}
								{(isActive || isDelivered) && (
									<div className="order-card__tracking">
										<div className="track-bar">
											{TRACK_STEPS.map((step, i) => (
												<React.Fragment key={step}>
													<div className={`track-step${i <= stepIndex ? ' track-step--done' : ''}`}>
														<div className="track-step__dot" />
														<span className="track-step__label">{step}</span>
													</div>
													{i < TRACK_STEPS.length - 1 && (
														<div className={`track-line${i < stepIndex ? ' track-line--done' : ''}`} />
													)}
												</React.Fragment>
											))}
										</div>
									</div>
								)}

								{/* Cancel reason */}
								{isCancelled && order.cancelReason && (
									<p className="order-card__cancel-reason">Reason: {order.cancelReason}</p>
								)}

								{/* Footer: total + actions */}
								<div className="order-card__foot">
									<div className="order-card__total">
										<span>Total</span>
										<strong>${order.orderTotal.toFixed(2)}</strong>
									</div>
									<div className="order-card__actions">
										{order.orderStatus === OrderStatus.PENDING && (
											<button
												className="btn btn--pay btn--sm"
												onClick={() => setSelectedOrder(order)}
											>
												💳 Pay Now
											</button>
										)}
										{isActive && (
											<button
												className="btn btn--danger btn--sm"
												disabled={cancellingId === order._id}
												onClick={() => handleCancel(order._id)}
											>
												{cancellingId === order._id ? 'Cancelling…' : 'Cancel order'}
											</button>
										)}
										{isDelivered && (
											<Link href="/shop" className="btn btn--outline btn--sm">Reorder</Link>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		{selectedOrder && (
				<PaymentModal
					order={selectedOrder}
					open={!!selectedOrder}
					onClose={() => setSelectedOrder(null)}
					onComplete={() => { setSelectedOrder(null); refetch(); }}
				/>
			)}
		</div>
	);
}
