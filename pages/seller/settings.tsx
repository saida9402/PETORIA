import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Typography, Button } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useMutation, useReactiveVar } from '@apollo/client';
import { UPDATE_MEMBER, IMAGE_UPLOADER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { MemberUpdate } from '../../libs/types/member/member.update';
import { API_URL, Messages } from '../../libs/config';
import { updateStorage, updateUserInfo } from '../../libs/auth';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SellerSettings: NextPage = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) {
			router.replace('/account/join').then();
		} else if (user.memberType !== 'SELLER') {
			router.replace('/mypage').then();
		}
	}, [user]);

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
	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;
			const { data } = await imageUploader({ variables: { file, target: 'member' } });
			if (data?.imageUploader) setUpdateData((prev) => ({ ...prev, memberImage: data.imageUploader }));
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const saveHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const result = await updateMember({
				variables: { input: { ...updateData, _id: user._id } },
			});
			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Store settings saved!');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const isDisabled = !updateData.memberNick || !updateData.memberPhone;

	if (device === 'mobile') {
		return <div>SELLER SETTINGS MOBILE</div>;
	}

	return (
		<div id="seller-settings-page">
			<div className="container">
				<div className="ssg-layout">
					{/* ── Sidebar Nav ── */}
					<aside className="ssg-sidebar">
						<div className="ssg-sidebar__header">
							<StorefrontIcon className="ssg-sidebar__icon" />
							<Typography className="ssg-sidebar__title">Store Settings</Typography>
						</div>
						<nav className="ssg-nav">
							<a href="#profile" className="ssg-nav__link ssg-nav__link--active">
								👤 Profile
							</a>
							<a href="#store-info" className="ssg-nav__link">
								🏪 Store Info
							</a>
							<a href="#contact" className="ssg-nav__link">
								📞 Contact
							</a>
						</nav>
					</aside>

					{/* ── Main Form ── */}
					<div className="ssg-form">
						{/* Profile Section */}
						<section id="profile" className="ssg-section">
							<Typography className="ssg-section__title">Profile Photo</Typography>
							<Typography className="ssg-section__sub">This is how buyers will recognize your store.</Typography>
							<div className="ssg-avatar-row">
								<div className="ssg-avatar">
									<img
										src={
											updateData.memberImage ? `${API_URL}/${updateData.memberImage}` : '/img/profile/defaultUser.svg'
										}
										alt="Store avatar"
									/>
									<label htmlFor="avatar-upload" className="ssg-avatar__overlay">
										<CameraAltIcon sx={{ fontSize: 20, color: '#fff' }} />
									</label>
									<input
										id="avatar-upload"
										type="file"
										accept="image/jpg,image/jpeg,image/png"
										hidden
										onChange={uploadImage}
									/>
								</div>
								<div className="ssg-avatar-hint">
									<Typography className="ssg-hint__text">JPG, JPEG or PNG — Max 2MB</Typography>
									<Typography className="ssg-hint__sub">Recommended: 200×200px for best quality</Typography>
								</div>
							</div>
						</section>

						{/* Store Info */}
						<section id="store-info" className="ssg-section">
							<Typography className="ssg-section__title">Store Information</Typography>
							<Typography className="ssg-section__sub">
								Basic details about your store visible to all buyers.
							</Typography>
							<div className="ssg-field-row">
								<div className="ssg-field">
									<label className="ssg-field__label">Store Name (Username)</label>
									<input
										className="ssg-field__input"
										type="text"
										placeholder="Your store username"
										value={updateData.memberNick ?? ''}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberNick: value }))}
									/>
								</div>
								<div className="ssg-field">
									<label className="ssg-field__label">Full Name</label>
									<input
										className="ssg-field__input"
										type="text"
										placeholder="Your full name"
										value={updateData.memberFullName ?? ''}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberFullName: value }))}
									/>
								</div>
							</div>
							<div className="ssg-field ssg-field--full">
								<label className="ssg-field__label">Store Description</label>
								<textarea
									className="ssg-field__textarea"
									rows={4}
									placeholder="Tell buyers about your store, what you sell, your pet care philosophy..."
									value={updateData.memberDesc ?? ''}
									onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberDesc: value }))}
								/>
							</div>
						</section>

						{/* Contact */}
						<section id="contact" className="ssg-section">
							<Typography className="ssg-section__title">Contact & Address</Typography>
							<Typography className="ssg-section__sub">
								Buyers may use this to reach you or estimate delivery.
							</Typography>
							<div className="ssg-field-row">
								<div className="ssg-field">
									<label className="ssg-field__label">Phone Number</label>
									<input
										className="ssg-field__input"
										type="tel"
										placeholder="+82 10-0000-0000"
										value={updateData.memberPhone ?? ''}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberPhone: value }))}
									/>
								</div>
								<div className="ssg-field">
									<label className="ssg-field__label">Store Address</label>
									<input
										className="ssg-field__input"
										type="text"
										placeholder="City, Country"
										value={updateData.memberAddress ?? ''}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberAddress: value }))}
									/>
								</div>
							</div>
						</section>

						{/* Save */}
						<div className="ssg-save-row">
							<Button className="ssg-save-btn" onClick={saveHandler} disabled={isDisabled}>
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

SellerSettings.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberFullName: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default withLayoutBasic(SellerSettings);
