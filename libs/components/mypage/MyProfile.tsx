import React, { useCallback, useEffect, useState } from 'react';
import { loadSavedCards, persistSavedCards, SavedCard } from './PaymentModal';

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
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import { API_URL, Messages } from '../../config';
import { updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER, IMAGE_UPLOADER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	// ── Saved Cards state ──
	const [cards, setCards] = useState<SavedCard[]>([]);
	const [showAddCard, setShowAddCard] = useState(false);
	const [newCardNum, setNewCardNum] = useState('');
	const [newHolder, setNewHolder] = useState('');
	const [newExpiry, setNewExpiry] = useState('');
	const [newCvv, setNewCvv] = useState('');

	useEffect(() => {
		setCards(loadSavedCards());
	}, []);

	const syncCards = (next: SavedCard[]) => {
		persistSavedCards(next);
		setCards(next);
	};

	const setDefaultCard = (id: string) => {
		syncCards(cards.map((c) => ({ ...c, isDefault: c.id === id })));
	};

	const deleteCard = (id: string) => {
		let next = cards.filter((c) => c.id !== id);
		if (next.length && !next.some((c) => c.isDefault)) next[0] = { ...next[0], isDefault: true };
		syncCards(next);
	};

	const addCard = () => {
		if (!newCardNum.replace(/\s/g, '') || !newHolder || !newExpiry) return;
		const last4 = newCardNum.replace(/\s/g, '').slice(-4);
		const d = newCardNum.replace(/\s/g, '');
		const brand = /^4/.test(d) ? 'Visa' : /^5[1-5]/.test(d) ? 'Mastercard' : /^3[47]/.test(d) ? 'Amex' : 'Card';
		const newCard: SavedCard = {
			id: Date.now().toString(),
			last4, brand, holderName: newHolder, expiry: newExpiry,
			isDefault: cards.length === 0,
		};
		syncCards([...cards, newCard]);
		setNewCardNum(''); setNewHolder(''); setNewExpiry(''); setNewCvv('');
		setShowAddCard(false);
	};

	const fmtNum = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
	const fmtExp = (v: string) => { let d = v.replace(/\D/g, '').slice(0, 4); if (d.length >= 3) d = d.slice(0,2)+'/'+d.slice(2); return d; };

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
			memberDesc: user.memberDesc,
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;

			const { data } = await imageUploader({ variables: { file, target: 'member' } });
			if (!data?.imageUploader) return;

			setUpdateData((prev) => ({ ...prev, memberImage: data.imageUploader }));
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;

			const result = await updateMember({
				variables: { input: updateData },
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Profile updated successfully!');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const openPostcode = async () => {
		await loadDaumPostcode();
		if (!window.daum?.Postcode) return;
		new window.daum.Postcode({
			oncomplete: (data: any) => {
				const parts = [data.roadAddress, data.buildingName, data.zonecode].filter(Boolean);
				setUpdateData((prev) => ({ ...prev, memberAddress: parts.join(' ') }));
			},
		}).open();
	};

	const doDisabledCheck = () => {
		return !updateData.memberNick || !updateData.memberPhone || !updateData.memberAddress || !updateData.memberImage;
	};

	if (device === 'mobile') {
		return <>MY PROFILE MOBILE</>;
	}

	return (
		<div id="my-profile-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Profile</Typography>
					<Typography className="sub-title">Keep your pet lover profile up to date!</Typography>
				</Stack>
			</Stack>

			<Stack className="top-box">
				{/* Avatar Upload */}
				<Stack className="photo-box">
					<Typography className="title">Profile Photo</Typography>
					<Stack className="image-big-box">
						<Stack className="image-box">
							<img
								src={updateData?.memberImage ? `${API_URL}/${updateData?.memberImage}` : `/img/profile/defaultUser.svg`}
								alt="profile"
							/>
						</Stack>
						<Stack className="upload-big-box">
							<input
								type="file"
								hidden
								id="hidden-input"
								onChange={uploadImage}
								accept="image/jpg, image/jpeg, image/png"
							/>
							<label htmlFor="hidden-input" className="labeler">
								<Typography>Upload Photo</Typography>
							</label>
							<Typography className="upload-text">JPG, JPEG or PNG format only</Typography>
						</Stack>
					</Stack>
				</Stack>

				{/* Basic Fields */}
				<Stack className="small-input-box">
					<Stack className="input-box">
						<Typography className="title">Username</Typography>
						<input
							type="text"
							placeholder="Your username"
							value={updateData.memberNick}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
						/>
					</Stack>

					<Stack className="input-box">
						<Typography className="title">Phone</Typography>
						<input
							type="text"
							placeholder="Your phone number"
							value={updateData.memberPhone}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
						/>
					</Stack>
				</Stack>

				<Stack className="address-box">
					<Typography className="title">Delivery Address</Typography>
					<Stack direction="row" gap={1} alignItems="center">
						<input
							type="text"
							placeholder="Your delivery address"
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
							style={{ flex: 1 }}
						/>
						<Button
							variant="outlined"
							size="small"
							onClick={openPostcode}
							sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
						>
							Search address
						</Button>
					</Stack>
				</Stack>

				{/* About / Bio */}
				<Stack className="address-box">
					<Typography className="title">About Me & My Pets 🐾</Typography>
					<textarea
						rows={3}
						placeholder="Tell us about yourself and your pets..."
						value={updateData.memberDesc ?? ''}
						onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
						style={{ resize: 'vertical' }}
					/>
				</Stack>

				{/* ── Saved Cards ── */}
				<Stack className="saved-cards-box">
					<Typography className="title">Saved Cards 💳</Typography>
					{cards.length === 0 && !showAddCard && (
						<p className="saved-cards-empty">No saved cards yet.</p>
					)}
					{cards.map((card) => (
						<div key={card.id} className={`saved-card-row${card.isDefault ? ' saved-card-row--default' : ''}`}>
							<div className="saved-card-row__info">
								<span className="saved-card-row__brand">{card.brand}</span>
								<span className="saved-card-row__num">•••• {card.last4}</span>
								<span className="saved-card-row__holder">{card.holderName}</span>
								<span className="saved-card-row__exp">{card.expiry}</span>
							</div>
							<div className="saved-card-row__actions">
								{card.isDefault && <span className="saved-card-row__badge">Default</span>}
								{!card.isDefault && (
									<button className="sc-link-btn" onClick={() => setDefaultCard(card.id)}>
										Set default
									</button>
								)}
								<button className="sc-link-btn sc-link-btn--danger" onClick={() => deleteCard(card.id)}>
									Remove
								</button>
							</div>
						</div>
					))}

					{showAddCard ? (
						<div className="saved-card-form">
							<div className="sc-field-row">
								<div className="sc-field">
									<label>Card Number</label>
									<input placeholder="XXXX XXXX XXXX XXXX" value={newCardNum} maxLength={19} onChange={e => setNewCardNum(fmtNum(e.target.value))} />
								</div>
							</div>
							<div className="sc-field-row">
								<div className="sc-field">
									<label>Cardholder Name</label>
									<input placeholder="Full name on card" value={newHolder} onChange={e => setNewHolder(e.target.value)} />
								</div>
							</div>
							<div className="sc-field-row sc-field-row--half">
								<div className="sc-field">
									<label>Expiry</label>
									<input placeholder="MM/YY" value={newExpiry} maxLength={5} onChange={e => setNewExpiry(fmtExp(e.target.value))} />
								</div>
								<div className="sc-field">
									<label>CVV</label>
									<input placeholder="•••" type="password" value={newCvv} maxLength={4} onChange={e => setNewCvv(e.target.value.replace(/\D/g,'').slice(0,4))} />
								</div>
							</div>
							<div className="sc-form-actions">
								<button className="sc-save-btn" onClick={addCard}>Save Card</button>
								<button className="sc-cancel-btn" onClick={() => setShowAddCard(false)}>Cancel</button>
							</div>
						</div>
					) : (
						<button className="sc-add-btn" onClick={() => setShowAddCard(true)}>
							+ Add new card
						</button>
					)}
				</Stack>

				<Stack className="about-me-box">
					<Button className="update-button" onClick={updateProfileHandler} disabled={doDisabledCheck()}>
						<Typography>Save Profile</Typography>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
							<g clipPath="url(#clip0)">
								<path
									d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
									fill="white"
								/>
							</g>
							<defs>
								<clipPath id="clip0">
									<rect width="13" height="13" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;
