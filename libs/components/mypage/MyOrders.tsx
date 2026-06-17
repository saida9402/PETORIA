import React, { useMemo, useState } from 'react';
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
	[OrderStatus.PENDING]:   { label: 'Pending',    color: '#92400e', bg: '#fef3c7' },
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
	const [statusFilter, setStatusFilter] = useState<string>('');
	// Input state (what the user is typing/selecting)
	const [inputSearch, setInputSearch] = useState('');
	const [inputYear, setInputYear] = useState<number | ''>('');
	// Committed state (what's actually applied to the filter — only updates on Search click)
	const [activeSearch, setActiveSearch] = useState('');
	const [activeYear, setActiveYear] = useState<number | ''>('');
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	const handleSearch = () => {
		setActiveSearch(inputSearch);
		setActiveYear(inputYear);
	};

	// Immediately reset active search when the input is cleared so the full list returns.
	const handleSearchChange = (val: string) => {
		setInputSearch(val);
		if (val === '') setActiveSearch('');
	};

	const handleClear = () => {
		setInputSearch('');
		setActiveSearch('');
	};

	const { data, loading, refetch } = useQuery(GET_MY_ORDERS, {
		skip: !user._id,
		fetchPolicy: 'cache-and-network',
	});

	const [cancelOrder] = useMutation(CANCEL_ORDER);

	const orders: Order[] = data?.getMyOrders ?? [];

	// Unique years from order history, descending.
	const years = useMemo(() => {
		const seen: Record<number, true> = {};
		for (const o of orders) seen[new Date(o.createdAt).getFullYear()] = true;
		return Object.keys(seen).map(Number).sort((a, b) => b - a);
	}, [orders]);

	// Combined filtering: status applies immediately; search + year apply only after Search click.
	const filtered = useMemo(() => {
		let result = orders;

		if (statusFilter) {
			result = result.filter((o) => o.orderStatus === statusFilter);
		}

		if (activeYear !== '') {
			result = result.filter((o) => new Date(o.createdAt).getFullYear() === activeYear);
		}

		if (activeSearch.trim()) {
			const q = activeSearch.trim().toLowerCase();
			result = result.filter(
				(o) =>
					o._id.slice(-8).toLowerCase().includes(q) ||
					o.orderItems.some((item) => item.itemName?.toLowerCase().includes(q)),
			);
		}

		return result;
	}, [orders, statusFilter, activeYear, activeSearch]);

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

			{/* ── Search + Year + Search Button ── */}
			<div className="my-orders__toolbar">
				<div className="my-orders__search-wrap">
					<input
						className="my-orders__search"
						type="text"
						placeholder="Search by order ID or product name…"
						value={inputSearch}
						onChange={(e) => handleSearchChange(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					/>
					{inputSearch && (
						<button
							className="my-orders__search-clear"
							type="button"
							aria-label="Clear search"
							onClick={handleClear}
						>
							✕
						</button>
					)}
				</div>

				<select
					className="my-orders__year-select"
					value={inputYear}
					onChange={(e) => setInputYear(e.target.value === '' ? '' : Number(e.target.value))}
				>
					<option value="">All Years</option>
					{years.map((y) => (
						<option key={y} value={y}>{y}</option>
					))}
				</select>

				<button className="my-orders__search-btn" onClick={handleSearch}>
					Search
				</button>
			</div>

			{/* ── Status filter chips ── */}
			<div className="my-orders__filters">
				{STATUS_FILTERS.map((f) => (
					<button
						key={f.value}
						className={`order-filter-chip${statusFilter === f.value ? ' order-filter-chip--active' : ''}`}
						onClick={() => setStatusFilter(f.value)}
					>
						{f.label}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className="my-orders__empty">
					<span className="my-orders__empty-icon">📦</span>
					<p>{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
					{orders.length === 0 && (
						<Link href="/shop" className="btn btn--primary btn--sm">Start shopping →</Link>
					)}
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

								{/* Items — with product name */}
								<div className="order-card__items">
									{order.orderItems.map((item: OrderItem) => (
										<div key={item._id} className="order-item">
											<span className="order-item__icon">🛍️</span>
											<div className="order-item__details">
												{item.itemName && (
													<span className="order-item__name">{item.itemName}</span>
												)}
												<span className="order-item__qty">Qty: {item.itemQuantity}</span>
											</div>
											<span className="order-item__price">${(item.itemPrice * item.itemQuantity).toFixed(2)}</span>
										</div>
									))}
								</div>

								{/* Tracking bar */}
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
