import React, { useState, useEffect } from 'react';
import UserAvatar from '../common/UserAvatar';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { API_URL, Messages } from '../../config';
import { GET_MEMBER } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberMenuProps {}

const MemberMenu = (_props: MemberMenuProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category;
	const user = useReactiveVar(userVar);
	const [member, setMember] = useState<Member | null>(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const { memberId } = router.query;

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const {
		data: getMemberData,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getMemberData?.getMember) {
			const m: Member = getMemberData.getMember;
			setMember(m);
			setIsFollowing(m?.meFollowed?.[0]?.myFollowing ?? false);
		}
	}, [getMemberData]);

	const handleFollow = async () => {
		try {
			if (!member?._id) throw new Error(Messages.error1);
			if (!user?._id) throw new Error(Messages.error2);
			const next = !isFollowing;
			setIsFollowing(next);
			if (next) {
				await subscribe({ variables: { input: member._id } });
				await sweetTopSmallSuccessAlert('Followed!', 800);
			} else {
				await unsubscribe({ variables: { input: member._id } });
				await sweetTopSmallSuccessAlert('Unfollowed!', 800);
			}
			getMemberRefetch({ input: memberId });
		} catch (err: any) {
			setIsFollowing((v) => !v);
			sweetErrorHandling(err).then();
		}
	};

	if (device === 'mobile') {
		return <div>MEMBER MENU MOBILE</div>;
	} else {
		return (
			<Stack width={'100%'} padding={'30px 24px'}>
				{/* Profile */}
				<Stack className={'profile'}>
					<Box component={'div'} className={'profile-img'}>
						<UserAvatar
							src={member?.memberImage ? `${API_URL}/${member?.memberImage}` : null}
							alt={member?.memberNick ?? ''}
						/>
					</Box>
					<Stack className={'user-info'}>
						<Typography className={'user-name'}>{member?.memberNick}</Typography>
						<Box component={'div'} className={'user-phone'}>
							<img src={'/img/icons/call.svg'} alt={'icon'} />
							<Typography className={'p-number'}>{member?.memberPhone}</Typography>
						</Box>
						<Typography className={'view-list'}>{member?.memberType}</Typography>
					</Stack>
				</Stack>

				{/* Follow Button */}
				<Stack className="follow-button-box">
					{isFollowing ? (
						<>
							<Button
								variant="outlined"
								sx={{ background: '#b9b9b9' }}
								onClick={handleFollow}
							>
								Unfollow
							</Button>
							<Typography>Following</Typography>
						</>
					) : (
						<Button
							variant="contained"
							sx={{ background: '#4E8A28', ':hover': { background: '#3A6B1E' } }}
							onClick={handleFollow}
						>
							Follow 🐾
						</Button>
					)}
				</Stack>

				<Stack className={'sections'}>
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							Details
						</Typography>
						<List className={'sub-section'}>
							{/* SELLER products */}
							{member?.memberType === 'SELLER' && (
								<ListItem className={category === 'products' ? 'focus' : ''}>
									<Link
										href={{ pathname: '/member', query: { ...router.query, category: 'products' } }}
										scroll={false}
										style={{ width: '100%' }}
									>
										<div className={'flex-box'}>
											{category === 'products' ? (
												<img className={'com-icon'} src={'/img/icons/homeWhite.svg'} alt={''} />
											) : (
												<img className={'com-icon'} src={'/img/icons/home.svg'} alt={''} />
											)}
											<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
												Products
											</Typography>
											<Typography className="count-title" variant="subtitle1">
												{member?.memberProducts ?? 0}
											</Typography>
										</div>
									</Link>
								</ListItem>
							)}

							{/* Followers */}
							<ListItem className={category === 'followers' ? 'focus' : ''}>
								<Link
									href={{ pathname: '/member', query: { ...router.query, category: 'followers' } }}
									scroll={false}
									style={{ width: '100%' }}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followers' ? 'white' : '#2D5016'}
											height="800px"
											width="800px"
											viewBox="0 0 328 328"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g>
												<path d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z" />
												<path d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z" />
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Followers
										</Typography>
										<Typography className="count-title" variant="subtitle1">
											{member?.memberFollowers}
										</Typography>
									</div>
								</Link>
							</ListItem>

							{/* Followings */}
							<ListItem className={category === 'followings' ? 'focus' : ''}>
								<Link
									href={{ pathname: '/member', query: { ...router.query, category: 'followings' } }}
									scroll={false}
									style={{ width: '100%' }}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followings' ? 'white' : '#2D5016'}
											height="800px"
											width="800px"
											viewBox="0 0 328 328"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g>
												<path d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z" />
												<path d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105C328,163.854,280.896,116.75,223,116.75z" />
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Followings
										</Typography>
										<Typography className="count-title" variant="subtitle1">
											{member?.memberFollowings}
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>

					{/* Community */}
					<Stack className={'section'} sx={{ marginTop: '10px' }}>
						<Typography className="title" variant={'h5'}>
							🐾 Community
						</Typography>
						<List className={'sub-section'}>
							<ListItem className={category === 'articles' ? 'focus' : ''}>
								<Link
									href={{ pathname: '/member', query: { ...router.query, category: 'articles' } }}
									scroll={false}
									style={{ width: '100%' }}
								>
									<div className={'flex-box'}>
										{category === 'articles' ? (
											<img className={'com-icon'} src={'/img/icons/discoveryWhite.svg'} alt={''} />
										) : (
											<img className={'com-icon'} src={'/img/icons/discovery.svg'} alt={''} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Articles
										</Typography>
										<Typography className="count-title" variant="subtitle1">
											{member?.memberArticles}
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default MemberMenu;
