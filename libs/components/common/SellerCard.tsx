import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface SellerCardProps {
	seller: any;
	likeMemberHandler: any;
}

const SellerCard = (props: SellerCardProps) => {
	const { seller, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = seller?.storeLogo
		? `${API_URL}/${seller.storeLogo}`
		: seller?.memberImage
		? `${API_URL}/${seller.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>SELLER CARD MOBILE</div>;
	} else {
		return (
			<Stack className="agent-general-card">
				<Link href={{ pathname: '/seller/detail', query: { sellerId: seller?._id } }}>
					<Box
						component={'div'}
						className={'agent-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{seller?.memberProducts ?? 0} products</div>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link href={{ pathname: '/seller/detail', query: { sellerId: seller?._id } }}>
							<strong>{seller?.memberFullName ?? seller?.memberNick}</strong>
						</Link>
						<span>🛍 Seller</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{seller?.memberViews}</Typography>
						<IconButton color={'default'} onClick={() => likeMemberHandler(user, seller?._id)}>
							{seller?.meLiked && seller?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{seller?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default SellerCard;
