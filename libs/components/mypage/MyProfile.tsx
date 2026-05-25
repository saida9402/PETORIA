import React, { useCallback, useEffect, useState } from 'react';
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
					<input
						type="text"
						placeholder="Your delivery address"
						value={updateData.memberAddress}
						onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
					/>
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
