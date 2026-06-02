import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { CREATE_ORDER, UPDATE_MEMBER } from '../../apollo/user/mutation';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CartItem as SharedCartItem, getCart as readCart, saveCart as writeCart, subscribeCart } from '../../libs/cart';
import { updateStorage, updateUserInfo } from '../../libs/auth';
import { API_URL } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type CartItem = SharedCartItem;
const getCart = readCart;
const saveCart = writeCart;

const TYPE_EMOJI: Record<string, string> = { DOG: '🐶', CAT: '🐱', BIRD: '🦜', FISH: '🐟' };

/** Strip any leading "uploads/" segments so stale and fresh localStorage data
 *  both resolve correctly, then prepend the backend base URL exactly once. */
function productImageUrl(raw: string): string {
	const clean = raw.replace(/^(uploads\/)+/, '');
	return `${API_URL}/uploads/${clean}`;
}

/* ── Address validation ───────────────────────────────────────────────────── */
function isValidAddress(addr: string): boolean {
	const s = addr.trim();
	if (s.length < 5 || s.length > 200) return false;
	// reject single repeated character pattern ("aaaaa", "nnnnn")
	if (/^(.)\1+$/.test(s)) return false;
	// require at least 2 unique letters
	const letters = s.replace(/[^a-zA-Z가-힣]/g, '');
	if (new Set(letters).size < 2) return false;
	// must have a digit OR a comma OR a Korean character
	const hasDigit = /\d/.test(s);
	const hasComma = s.includes(',');
	const hasKorean = /[가-힣]/.test(s);
	if (!hasDigit && !hasComma && !hasKorean) return false;
	// if no Korean, require at least 2 words
	if (!hasKorean && s.trim().split(/\s+/).length < 2) return false;
	return true;
}

/* ── Daum Postcode loader ─────────────────────────────────────────────────── */
declare global {
	interface Window {
		daum?: { Postcode: new (opts: { oncomplete: (data: any) => void }) => { open: () => void } };
	}
}

function loadDaumPostcode(): Promise<void> {
	return new Promise((resolve) => {
		if (window.daum?.Postcode) { resolve(); return; }
		const script = document.createElement('script');
		script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
		script.onload = () => resolve();
		document.head.appendChild(script);
	});
}

/* ── Page ────────────────────────────────────────────────────────────────── */
const CartPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [items, setItems] = useState<CartItem[]>([]);
	const [address, setAddress] = useState('');
	const [note, setNote] = useState('');
	const [placing, setPlacing] = useState(false);
	const [addrError, setAddrError] = useState('');
	const touchedRef = useRef(false);

	const [createOrder] = useMutation(CREATE_ORDER);
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/* Load cart */
	useEffect(() => {
		setItems(getCart());
		return subscribeCart(() => setItems(getCart()));
	}, []);

	/* Auto-fill from saved profile address — only if user hasn't typed yet */
	useEffect(() => {
		if (user.memberAddress && !touchedRef.current) {
			setAddress(user.memberAddress);
		}
	}, [user.memberAddress]);

	/* Validate on change */
	const handleAddressChange = (val: string) => {
		touchedRef.current = true;
		setAddress(val);
		if (val.trim() && !isValidAddress(val)) {
			setAddrError('Please enter a valid delivery address (use Search address for accuracy).');
		} else {
			setAddrError('');
		}
	};

	/* Open Daum Postcode popup */
	const openPostcode = async () => {
		await loadDaumPostcode();
		if (!window.daum?.Postcode) return;
		new window.daum.Postcode({
			oncomplete: (data: any) => {
				const parts = [data.roadAddress, data.buildingName, data.zonecode].filter(Boolean);
				const selected = parts.join(' ');
				touchedRef.current = true;
				setAddress(selected);
				setAddrError('');
			},
		}).open();
	};

	const updateQty = (productId: string, delta: number) => {
		const next = items.map((it) =>
			it.productId === productId ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it,
		);
		setItems(next);
		saveCart(next);
	};

	const removeItem = (productId: string) => {
		const next = items.filter((it) => it.productId !== productId);
		setItems(next);
		saveCart(next);
	};

	const clearCart = () => {
		setItems([]);
		saveCart([]);
	};

	const subtotal = items.reduce((sum, it) => sum + it.productPrice * it.quantity, 0);
	const shipping = subtotal > 50 ? 0 : 4.99;
	const total = subtotal + shipping;

	const addressValid = isValidAddress(address);

	const handleCheckout = async () => {
		if (!user._id) { router.push('/account/join'); return; }
		if (items.length === 0) return;
		if (!addressValid) {
			setAddrError('Please enter a valid delivery address.');
			return;
		}
		const yes = await sweetConfirmAlert(`Place order for $${total.toFixed(2)}?`);
		if (!yes) return;

		try {
			setPlacing(true);

			/* Sync address back to profile if it changed (non-fatal) */
			if (user._id && address.trim() !== (user.memberAddress ?? '')) {
				try {
					const { data } = await updateMember({
						variables: { input: { _id: user._id, memberAddress: address.trim() } },
					});
					const token = data?.updateMember?.accessToken;
					if (token) { updateStorage({ jwtToken: token }); updateUserInfo(token); }
				} catch {
					/* non-fatal — proceed with order anyway */
				}
			}

			await createOrder({
				variables: {
					input: {
						orderItems: items.map((it) => ({
							productId: it.productId,
							itemQuantity: it.quantity,
							itemPrice: it.productPrice,
						})),
						paymentMethod: 'CREDIT_CARD',
						orderAddress: address.trim(),
						orderNote: note || undefined,
					},
				},
			});
			clearCart();
			await sweetTopSmallSuccessAlert('Order placed! Check My Orders.', 2000);
			router.push('/mypage?category=myOrders');
		} catch (err) {
			sweetErrorHandling(err).then();
		} finally {
			setPlacing(false);
		}
	};

	return (
		<div className="cart-page">
			<div className="wrap">
				{/* Breadcrumb */}
				<nav className="cart-breadcrumb">
					<Link href="/">Home</Link>
					<span>/</span>
					<span>Cart</span>
				</nav>

				<h1 className="cart-page__title">Shopping Cart</h1>

				{items.length === 0 ? (
					<div className="cart-empty">
						<div className="cart-empty__icon">🛒</div>
						<h2>Your cart is empty</h2>
						<p>Looks like you haven't added anything yet.</p>
						<Link href="/shop" className="btn btn--primary">
							Browse products →
						</Link>
					</div>
				) : (
					<div className="cart-layout">
						{/* Left: items list */}
						<div className="cart-items">
							<div className="cart-items__head">
								<span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
								<button className="cart-clear-btn" onClick={clearCart}>Clear all</button>
							</div>

							{items.map((item) => (
								<div key={item.productId} className="cart-row">
									{/* Thumbnail */}
									<div className="cart-row__thumb">
										{item.productImage ? (
											<img
												src={productImageUrl(item.productImage)}
												alt={item.productName}
												onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
											/>
										) : (
											<span className="cart-row__thumb-emoji">{TYPE_EMOJI[item.productType] ?? '🐾'}</span>
										)}
									</div>

									{/* Info */}
									<div className="cart-row__info">
										<p className="cart-row__brand">{item.productBrand}</p>
										<p className="cart-row__name">{item.productName}</p>
										<p className="cart-row__price">${item.productPrice.toFixed(2)}</p>
									</div>

									{/* Qty controls */}
									<div className="cart-row__qty">
										<button className="qty-btn" onClick={() => updateQty(item.productId, -1)}>−</button>
										<span className="qty-val">{item.quantity}</span>
										<button className="qty-btn" onClick={() => updateQty(item.productId, 1)}>+</button>
									</div>

									{/* Line total */}
									<div className="cart-row__line-total">
										${(item.productPrice * item.quantity).toFixed(2)}
									</div>

									{/* Remove */}
									<button className="cart-row__remove" onClick={() => removeItem(item.productId)} aria-label="Remove">
										✕
									</button>
								</div>
							))}
						</div>

						{/* Right: order summary */}
						<div className="cart-summary">
							<h2 className="cart-summary__title">Order Summary</h2>

							<div className="cart-summary__row">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							<div className="cart-summary__row">
								<span>Shipping</span>
								<span>{shipping === 0 ? <span className="cart-free">FREE</span> : `$${shipping.toFixed(2)}`}</span>
							</div>
							{shipping > 0 && (
								<p className="cart-summary__free-hint">Add ${(50 - subtotal).toFixed(2)} more for free delivery</p>
							)}
							<div className="cart-summary__divider" />
							<div className="cart-summary__row cart-summary__row--total">
								<span>Total</span>
								<strong>${total.toFixed(2)}</strong>
							</div>

							{/* Delivery address */}
							<div className="cart-summary__field">
								<label>Delivery address *</label>
								<div style={{ display: 'flex', gap: 6 }}>
									<input
										type="text"
										placeholder="Enter your address"
										value={address}
										onChange={(e) => handleAddressChange(e.target.value)}
										className={`cart-input${addrError ? ' cart-input--error' : ''}`}
										style={{ flex: 1 }}
									/>
									<button
										type="button"
										className="btn btn--outline btn--sm"
										onClick={openPostcode}
										style={{ whiteSpace: 'nowrap' }}
									>
										Search address
									</button>
								</div>
								{addrError && (
									<p style={{ fontSize: 12, color: '#e11d48', marginTop: 4 }}>{addrError}</p>
								)}
							</div>

							{/* Note */}
							<div className="cart-summary__field">
								<label>Order note (optional)</label>
								<input
									type="text"
									placeholder="e.g. Leave at door"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className="cart-input"
								/>
							</div>

							{!user._id ? (
								<div className="cart-summary__guest">
									<p>Sign in to place your order</p>
									<Link href="/account/join" className="btn btn--primary btn--full">
										Sign in →
									</Link>
								</div>
							) : (
								<button
									className="btn btn--primary btn--full"
									onClick={handleCheckout}
									disabled={placing || items.length === 0 || !addressValid}
								>
									{placing ? 'Placing order…' : `Place Order · $${total.toFixed(2)}`}
								</button>
							)}

							<Link href="/shop" className="cart-summary__continue">
								← Continue shopping
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(CartPage);
