import React from 'react';
import { ArrowBendUpLeft } from 'phosphor-react';
import { Stack, Box, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import { format } from 'date-fns';
import { API_URL } from '../../config';
import UserAvatar from '../common/UserAvatar';

interface ReviewCardProps {
	fromMyPage?: string;
	comment: Comment;
}

const ReviewCard = (props: ReviewCardProps) => {
	const { fromMyPage, comment } = props;
	const imagePath: string | null = comment?.memberData?.memberImage
		? `${API_URL}/${comment?.memberData?.memberImage}`
		: null;

	return (
		<Box component={'div'} className={'review-card'}>
			<div className={'info'}>
				<div className={'left'}>
					<UserAvatar src={imagePath} alt={comment?.memberData?.memberNick ?? ''} />
					<div>
						<strong>{comment.memberData?.memberNick}</strong>
						<span>
							{format(new Date(comment.createdAt), 'dd MMMM')}
						</span>
					</div>
				</div>
			</div>
			<p>{comment.commentContent}</p>
			{fromMyPage && (
				<Stack className="reply-button-box">
					<ArrowBendUpLeft size={16} color="#4E8A28" />
					<Typography className="reply-text">Reply</Typography>
				</Stack>
			)}
		</Box>
	);
};

export default ReviewCard;
