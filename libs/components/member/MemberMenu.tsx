import React, { useState, useEffect } from 'react';
import { Phone, House, Compass, UsersThree } from 'phosphor-react';
import UserAvatar from '../common/UserAvatar';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, Button } from '@mui/material';
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

	return (
		<Stack width={'100%'} padding={'30px 24px'}>
				{/* Profile */}
				<Stack className={'profile'}>
					<Box component={'div'} className={'profile-img'}>
						<UserAvatar
							src={member?.memberImage ? `${API_URL}/${member?.memberImage}` : null}
							alt={member?.memberNick ?? ''}
							size={60}
						/>
					</Box>
					<Stack className={'user-info'}>
						<Typography className={'user-name'}>{member?.memberNick}</Typography>
						<Box component={'div'} className={'user-phone'}>
							<Phone size={16} />
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
											<House className={'com-icon'} size={18} color={category === 'products' ? 'white' : '#2D5016'} />
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
										<UsersThree className={'com-icon'} size={18} color={category === 'followers' ? 'white' : '#2D5016'} />
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
										<UsersThree className={'com-icon'} size={18} color={category === 'followings' ? 'white' : '#2D5016'} />
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
										<Compass className={'com-icon'} size={18} color={category === 'articles' ? 'white' : '#2D5016'} />
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
};

export default MemberMenu;
