import React from 'react';
import { useRouter } from 'next/router';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { API_URL } from '../../config';
import UserAvatar from './UserAvatar';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	likeArticleHandler: (e: React.MouseEvent, user: any, id: string) => void;
	size?: 'small' | 'normal';
}

const BADGE_CLASS: Record<string, string> = {
	FREE: 'badge--green',
	RECOMMEND: 'badge--blue',
	NEWS: 'badge--amber',
	HUMOR: 'badge--purple',
};

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim();
}

const CommunityCard = ({ boardArticle, likeArticleHandler, size = 'normal' }: CommunityCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const imagePath = boardArticle.articleImage
		? `${API_URL}/${boardArticle.articleImage}`
		: null;

	const authorImage = boardArticle.memberData?.memberImage
		? `${API_URL}/${boardArticle.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	const excerpt = boardArticle.articleContent
		? stripHtml(boardArticle.articleContent).slice(0, 120)
		: '';

	const handleCardClick = () => {
		router.push({
			pathname: `/community/${boardArticle._id}`,
			query: { articleCategory: boardArticle.articleCategory },
		});
	};

	const handleAuthorClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		const memberId = boardArticle.memberData?._id;
		if (!memberId) return;
		if (memberId === user?._id) {
			router.push('/mypage');
		} else if (boardArticle.memberData?.memberType === 'SELLER') {
			router.push(`/seller/${memberId}`);
		} else {
			router.push(`/member?memberId=${memberId}`);
		}
	};

	return (
		<div
			className="community-card community-general-card-config"
			onClick={handleCardClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
		>
			{/* Thumbnail */}
			<div className="community-card__thumb">
				{imagePath ? (
					<img
						src={imagePath}
						alt={boardArticle.articleTitle}
						className="community-card__thumb-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
				) : (
					<div className="community-card__thumb-placeholder">📝</div>
				)}
			</div>

			{/* Body */}
			<div className="community-card__body">
				<div className="community-card__top">
					<span className={`badge ${BADGE_CLASS[boardArticle.articleCategory] ?? 'badge--green'}`}>
						{boardArticle.articleCategory}
					</span>
					<span className="community-card__time">
						<Moment format="MMM DD, YYYY">{boardArticle.createdAt}</Moment>
					</span>
				</div>

				<p className="community-card__title">{boardArticle.articleTitle}</p>

				{excerpt && (
					<p className="community-card__excerpt">
						{excerpt}
						{excerpt.length >= 120 ? '…' : ''}
					</p>
				)}

				{/* Footer */}
				<div className="community-card__footer">
					<div
						className="community-card__author"
						style={{ cursor: 'pointer' }}
						onClick={handleAuthorClick}
					>
						<div className="community-card__author-av">
							<UserAvatar src={authorImage} alt={boardArticle.memberData?.memberNick ?? ''} />
						</div>
						<span>{boardArticle.memberData?.memberNick}</span>
					</div>

					<div className="community-card__meta">
						<span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
							<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
							{boardArticle.articleViews}
						</span>
						<button
							type="button"
							className={`community-card__like${boardArticle.meLiked?.[0]?.myFavorite ? ' community-card__like--liked' : ''}`}
							onClick={(e) => {
								e.stopPropagation();
								likeArticleHandler(e, user, boardArticle._id);
							}}
						>
							{boardArticle.meLiked?.[0]?.myFavorite ? (
								<FavoriteIcon sx={{ fontSize: 13, color: '#e11d48' }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: 13 }} />
							)}
							{boardArticle.articleLikes}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CommunityCard;
