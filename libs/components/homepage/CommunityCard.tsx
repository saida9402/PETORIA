import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { API_URL } from '../../config';

const CAT_CFG: Record<string, { icon: string; badge: string }> = {
	FREE: { icon: '💬', badge: 'badge--green' },
	RECOMMEND: { icon: '💡', badge: 'badge--blue' },
	NEWS: { icon: '📰', badge: 'badge--purple' },
	HUMOR: { icon: '😄', badge: 'badge--amber' },
};

interface Article {
	_id: string;
	articleTitle: string;
	articleContent?: string;
	articleCategory: string;
	articleImage?: string;
	articleLikes: number;
	articleViews: number;
	createdAt: string;
	memberData?: {
		_id: string;
		memberNick: string;
		memberImage?: string;
	};
	meLiked?: { myFavorite: boolean }[];
}

interface Props {
	article: Article;
	variant?: 'default' | 'compact';
}

export default function CommunityCard({ article: a, variant = 'default' }: Props) {
	const router = useRouter();
	const [liked, setLiked] = useState(a.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(a.articleLikes);
	const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const cfg = CAT_CFG[a.articleCategory] ?? { icon: '🐾', badge: 'badge--green' };
	const imgSrc = a.articleImage ? `${API_URL}/${a.articleImage}` : null;
	const avSrc = a.memberData?.memberImage ? `${API_URL}/${a.memberData.memberImage}` : null;

	const daysAgo = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 86_400_000);
	const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeArticle({ variables: { articleId: a._id } });
			setLiked((prev) => !prev);
			setLikes((prev) => (liked ? prev - 1 : prev + 1));
		} catch {}
	};

	if (variant === 'compact') {
		return (
			<div className="community-card community-card--compact" onClick={() => router.push(`/board/${a._id}`)}>
				<div className="community-card__compact-icon">{cfg.icon}</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<p className="community-card__compact-title">{a.articleTitle}</p>
					<div className="community-card__compact-meta">
						<span>{timeLabel}</span>
						<span>·</span>
						<span>♥ {likes}</span>
						<span>·</span>
						<span>👁 {a.articleViews}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="community-card" onClick={() => router.push(`/board/${a._id}`)}>
			{/* Thumb */}
			<div className="community-card__thumb">
				{imgSrc ? (
					<img src={imgSrc} alt={a.articleTitle} className="community-card__thumb-img" />
				) : (
					<span className="community-card__thumb-icon">{cfg.icon}</span>
				)}
			</div>

			{/* Body */}
			<div className="community-card__body">
				<div className="community-card__top">
					<span className={`badge ${cfg.badge}`}>{a.articleCategory}</span>
					<span className="community-card__time">{timeLabel}</span>
				</div>

				<p className="community-card__title">{a.articleTitle}</p>

				{a.articleContent && (
					<p className="community-card__excerpt">{a.articleContent.replace(/[#*_>`]/g, '').slice(0, 90)}…</p>
				)}

				<div className="community-card__footer">
					{/* Author */}
					<div className="community-card__author">
						<div className="community-card__author-av">
							{avSrc ? (
								<img src={avSrc} alt={a.memberData?.memberNick} />
							) : (
								<span>{a.memberData?.memberNick?.[0]?.toUpperCase() ?? '?'}</span>
							)}
						</div>
						<span>{a.memberData?.memberNick ?? 'User'}</span>
					</div>

					<div className="community-card__meta">
						<span>👁 {a.articleViews}</span>
						<button
							className={`community-card__like${liked ? ' community-card__like--liked' : ''}`}
							onClick={handleLike}
						>
							{liked ? '❤️' : '🤍'} {likes}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
