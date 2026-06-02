import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_MY_ORDER_STATUS } from '../../../apollo/user/mutation';
import { Order } from '../../types/order/order';
import { OrderStatus } from '../../enums/order.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const STORAGE_KEY = 'petoria_saved_cards';

export interface SavedCard {
	id: string;
	last4: string;
	brand: string;
	holderName: string;
	expiry: string;
	isDefault: boolean;
}

const PAYMENT_METHODS = [
	{ id: 'APPLE_PAY', label: 'Apple Pay', icon: '🍎' },
	{ id: 'NAVER_PAY', label: 'Naver Pay', icon: '🟢' },
	{ id: 'KAKAO_PAY', label: 'Kakao Pay', icon: '💛' },
	{ id: 'TOSS_BANK', label: 'Toss Bank', icon: '💙' },
	{ id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
];

const NON_CARD_LABELS: Record<string, string> = {
	APPLE_PAY: 'Apple Pay',
	NAVER_PAY: 'Naver Pay',
	KAKAO_PAY: 'Kakao Pay',
	TOSS_BANK: 'Toss Bank',
};

const PROGRESS_STEPS: { status: OrderStatus; label: string; sublabel: string }[] = [
	{ status: OrderStatus.PROCESS, label: 'Confirmed', sublabel: '📦 Order confirmed — preparing your items...' },
	{ status: OrderStatus.CONFIRM, label: 'Shipped', sublabel: '🚚 Your order is on the way!' },
	{ status: OrderStatus.DELIVERED, label: 'Delivered', sublabel: '✅ Delivered!' },
];

export function loadSavedCards(): SavedCard[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	} catch {
		return [];
	}
}

export function persistSavedCards(cards: SavedCard[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function detectBrand(n: string): string {
	const d = n.replace(/\s/g, '');
	if (/^4/.test(d)) return 'Visa';
	if (/^5[1-5]/.test(d)) return 'Mastercard';
	if (/^3[47]/.test(d)) return 'Amex';
	return 'Card';
}

function fmtCardNumber(v: string) {
	return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function fmtExpiry(v: string) {
	let d = v.replace(/\D/g, '').slice(0, 4);
	if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
	return d;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Step = 'select-method' | 'card-form' | 'processing' | 'progress' | 'complete';

interface Props {
	order: Order;
	open?: boolean;
	onClose: () => void;
	onComplete: () => void;
}

export default function PaymentModal({ order, open = true, onClose, onComplete }: Props) {
	// ── all hooks unconditionally first ──────────────────────────
	const [step, setStep] = useState<Step>('select-method');
	const [method, setMethod] = useState('');
	const [cards, setCards] = useState<SavedCard[]>(loadSavedCards);
	const [selectedCardId, setSelectedCardId] = useState<string>(() => {
		const c = loadSavedCards();
		return c.find((x) => x.isDefault)?.id ?? c[0]?.id ?? '';
	});
	const [showNewCard, setShowNewCard] = useState(false);
	const [cardNum, setCardNum] = useState('');
	const [holder, setHolder] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvv, setCvv] = useState('');
	const [saveCard, setSaveCard] = useState(true);
	const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
	const cancelledRef = useRef(false);

	const [updateMyOrderStatus] = useMutation(UPDATE_MY_ORDER_STATUS);

	useEffect(() => {
		cancelledRef.current = false;
		return () => {
			cancelledRef.current = true;
		};
	}, []);

	if (!open) return null;

	// ── helpers (defined after the early return, not hooks) ──────

	const callMutation = async (to: OrderStatus): Promise<boolean> => {
		try {
			await updateMyOrderStatus({ variables: { input: { orderId: order._id, orderStatus: to } } });
			if (!cancelledRef.current) setStatus(to);
			return true;
		} catch (err: any) {
			if (!cancelledRef.current) await sweetMixinErrorAlert(err?.message ?? 'Failed to update order status');
			return false;
		}
	};

	const runProgressSequence = async () => {
		await wait(1200);
		if (cancelledRef.current) return;
		const ok1 = await callMutation(OrderStatus.CONFIRM);
		if (!ok1 || cancelledRef.current) return;

		await wait(1200);
		if (cancelledRef.current) return;
		const ok2 = await callMutation(OrderStatus.DELIVERED);
		if (!ok2 || cancelledRef.current) return;

		await wait(800);
		if (!cancelledRef.current) setStep('complete');
	};

	const processPayment = async () => {
		await wait(1500);
		if (cancelledRef.current) return;
		const ok = await callMutation(OrderStatus.PROCESS);
		if (!ok || cancelledRef.current) {
			setStep('select-method');
			return;
		}
		setStep('progress');
		runProgressSequence();
	};

	const handleMethodSelect = (id: string) => {
		setMethod(id);
		if (id === 'CARD') {
			setShowNewCard(cards.length === 0);
			setStep('card-form');
		} else {
			setStep('processing');
			processPayment();
		}
	};

	const handleCardSubmit = () => {
		const usingNew = showNewCard || cards.length === 0;
		if (usingNew && (!cardNum.replace(/\s/g, '') || !holder || !expiry)) return;
		if (!usingNew && !selectedCardId) return;

		if (usingNew && saveCard) {
			const last4 = cardNum.replace(/\s/g, '').slice(-4);
			const brand = detectBrand(cardNum);
			const isFirst = cards.length === 0;
			const newCard: SavedCard = { id: Date.now().toString(), last4, brand, holderName: holder, expiry, isDefault: isFirst };
			const next = [...cards, newCard];
			persistSavedCards(next);
			setCards(next);
			setSelectedCardId(newCard.id);
		}

		setStep('processing');
		processPayment();
	};

	const setDefault = (id: string) => {
		const next = cards.map((c) => ({ ...c, isDefault: c.id === id }));
		persistSavedCards(next);
		setCards(next);
		setSelectedCardId(id);
	};

	const removeCard = (id: string) => {
		let next = cards.filter((c) => c.id !== id);
		if (next.length && !next.some((c) => c.isDefault)) next[0] = { ...next[0], isDefault: true };
		persistSavedCards(next);
		setCards(next);
		if (selectedCardId === id) setSelectedCardId(next[0]?.id ?? '');
	};

	const progressIndex = PROGRESS_STEPS.findIndex((s) => s.status === status);
	const progressPercent = progressIndex < 0 ? 0 : ((progressIndex + 1) / PROGRESS_STEPS.length) * 100;
	const currentSublabel = PROGRESS_STEPS[progressIndex]?.sublabel ?? '⏳ Processing...';
	const displayMethod = NON_CARD_LABELS[method] ?? 'Credit / Debit Card';
	const isLocked = step === 'processing' || step === 'progress';

	return (
		<div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && !isLocked && onClose()}>
			<div className="pm-modal">
				{/* Header */}
				<div className="pm-modal__header">
					<span className="pm-modal__title">{step === 'complete' ? '🎉 Order Complete' : '💳 Payment'}</span>
					{!isLocked && step !== 'complete' && (
						<button className="pm-modal__close" onClick={onClose}>✕</button>
					)}
				</div>

				{/* Order summary strip */}
				{step !== 'complete' && (
					<div className="pm-modal__summary">
						<span className="pm-modal__order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
						<strong className="pm-modal__total">${order.orderTotal.toFixed(2)}</strong>
					</div>
				)}

				{/* ─── STEP 1: select-method ─── */}
				{step === 'select-method' && (
					<div className="pm-modal__body">
						<p className="pm-section-title">Select Payment Method</p>
						<div className="pm-methods">
							{PAYMENT_METHODS.map((pm) => (
								<button key={pm.id} className="pm-method-btn" onClick={() => handleMethodSelect(pm.id)}>
									<span className="pm-method-btn__icon">{pm.icon}</span>
									<span className="pm-method-btn__label">{pm.label}</span>
									<span className="pm-method-btn__arrow">›</span>
								</button>
							))}
						</div>
					</div>
				)}

				{/* ─── STEP 2: card-form ─── */}
				{step === 'card-form' && (
					<div className="pm-modal__body">
						{cards.length > 0 && !showNewCard ? (
							<>
								<p className="pm-section-title">Saved Cards</p>
								<div className="pm-saved-cards">
									{cards.map((card) => (
										<div
											key={card.id}
											className={`pm-saved-card${selectedCardId === card.id ? ' pm-saved-card--sel' : ''}`}
											onClick={() => setSelectedCardId(card.id)}
										>
											<input
												type="radio"
												readOnly
												checked={selectedCardId === card.id}
												onChange={() => setSelectedCardId(card.id)}
												onClick={(e) => e.stopPropagation()}
											/>
											<div className="pm-saved-card__info">
												<span className="pm-saved-card__brand">{card.brand}</span>
												<span className="pm-saved-card__num">•••• {card.last4}</span>
												<span className="pm-saved-card__name">{card.holderName}</span>
												<span className="pm-saved-card__exp">{card.expiry}</span>
											</div>
											{card.isDefault && <span className="pm-badge-default">Default</span>}
											<div className="pm-saved-card__btns">
												{!card.isDefault && (
													<button className="pm-link-btn" onClick={(e) => { e.stopPropagation(); setDefault(card.id); }}>
														Set default
													</button>
												)}
												<button className="pm-link-btn pm-link-btn--danger" onClick={(e) => { e.stopPropagation(); removeCard(card.id); }}>
													Remove
												</button>
											</div>
										</div>
									))}
								</div>
								<button className="pm-add-card-btn" onClick={() => setShowNewCard(true)}>+ Use a different card</button>
							</>
						) : (
							<div className="pm-card-form">
								{cards.length > 0 && (
									<button className="pm-back-link" onClick={() => setShowNewCard(false)}>← Saved cards</button>
								)}
								<div className="pm-field">
									<label className="pm-field__label">Card Number</label>
									<input className="pm-field__input" placeholder="XXXX XXXX XXXX XXXX" value={cardNum} onChange={(e) => setCardNum(fmtCardNumber(e.target.value))} maxLength={19} />
								</div>
								<div className="pm-field">
									<label className="pm-field__label">Cardholder Name</label>
									<input className="pm-field__input" placeholder="Full name on card" value={holder} onChange={(e) => setHolder(e.target.value)} />
								</div>
								<div className="pm-field-row">
									<div className="pm-field">
										<label className="pm-field__label">Expiry (MM/YY)</label>
										<input className="pm-field__input" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(fmtExpiry(e.target.value))} maxLength={5} />
									</div>
									<div className="pm-field">
										<label className="pm-field__label">CVV</label>
										<input className="pm-field__input" placeholder="•••" type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
									</div>
								</div>
								<label className="pm-checkbox">
									<input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
									Save this card for future payments
								</label>
							</div>
						)}
						<div className="pm-card-footer">
							<button className="pm-back-method-btn" onClick={() => setStep('select-method')}>← Back</button>
							<button className="pm-pay-btn" onClick={handleCardSubmit}>
								Pay ${order.orderTotal.toFixed(2)}
							</button>
						</div>
					</div>
				)}

				{/* ─── STEP 3: processing ─── */}
				{step === 'processing' && (
					<div className="pm-processing">
						<div className="pm-spinner" />
						<p className="pm-processing__label">Processing payment...</p>
						<span className="pm-processing__method">{displayMethod}</span>
					</div>
				)}

				{/* ─── STEP 4: progress ─── */}
				{step === 'progress' && (
					<div className="pm-progress-screen">
						<div className="pm-progress-steps">
							{PROGRESS_STEPS.map((s, i) => {
								const done = progressIndex >= i;
								const active = progressIndex === i;
								return (
									<React.Fragment key={s.status}>
										<div className={`pm-ps-step${done ? ' pm-ps-step--done' : ''}${active ? ' pm-ps-step--active' : ''}`}>
											<div className="pm-ps-step__dot">{done && <span>✓</span>}</div>
											<span className="pm-ps-step__label">{s.label}</span>
										</div>
										{i < PROGRESS_STEPS.length - 1 && (
											<div className={`pm-ps-line${progressIndex > i ? ' pm-ps-line--done' : ''}`} />
										)}
									</React.Fragment>
								);
							})}
						</div>
						<p className="pm-progress-screen__sublabel">{currentSublabel}</p>
						<div className="pm-bar-wrap">
							<div className="pm-bar-fill" style={{ width: `${progressPercent}%` }} />
						</div>
					</div>
				)}

				{/* ─── STEP 5: complete ─── */}
				{step === 'complete' && (
					<div className="pm-complete">
						<div className="pm-complete__emoji">🎉</div>
						<h3 className="pm-complete__title">Payment Successful!</h3>
						<p className="pm-complete__sub">Your order has been delivered.</p>
						<div className="pm-complete__summary">
							<div className="pm-complete__row">
								<span>Order ID</span>
								<strong>#{order._id.slice(-8).toUpperCase()}</strong>
							</div>
							<div className="pm-complete__row">
								<span>Total</span>
								<strong>${order.orderTotal.toFixed(2)}</strong>
							</div>
							<div className="pm-complete__row">
								<span>Method</span>
								<strong>{displayMethod}</strong>
							</div>
						</div>
						<button className="pm-complete__btn" onClick={onComplete}>
							Back to My Orders
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
