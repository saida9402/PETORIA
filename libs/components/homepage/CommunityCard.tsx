import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Heart, Eye } from 'phosphor-react';

import ForumIcon from '@mui/icons-material/Forum';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import MoodIcon from '@mui/icons-material/Mood';
import PetsIcon from '@mui/icons-material/Pets';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { API_URL } from '../../config';
import UserAvatar from '../common/UserAvatar';

const CAT_ICON_SX = { fontSize: 'inherit' } as const;

const CAT_CFG: Record<string, { icon: JSX.Element; badge: string }> = {
	FREE: { icon: <ForumIcon sx={CAT_ICON_SX} />, badge: 'badge--green' },
	RECOMMEND: { icon: <LightbulbIcon sx={CAT_ICON_SX} />, badge: 'badge--blue' },
	NEWS: { icon: <ArticleIcon sx={CAT_ICON_SX} />, badge: 'badge--purple' },
	HUMOR: { icon: <MoodIcon sx={CAT_ICON_SX} />, badge: 'badge--amber' },
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

	const cfg = CAT_CFG[a.articleCategory] ?? { icon: <PetsIcon sx={CAT_ICON_SX} />, badge: 'badge--green' };
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
		} catch (err) {
			console.error(err);
		}
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
						<span><Heart size={11} weight="fill" color="#e11d48" /> {likes}</span>
						<span>·</span>
						<span><Eye size={11} weight="duotone" /> {a.articleViews}</span>
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
					<img
						src={imgSrc}
						alt={a.articleTitle}
						className="community-card__thumb-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
				) : (
					<div style={{ width: '100%', height: '100%' }}>
						<div style={{
							background: 'linear-gradient(135deg, #1a472a 0%, #2d6a4a 100%)',
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
							<span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'sans-serif' }}>
								{a.articleCategory[0]}
							</span>
						</div>
					</div>
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
							<UserAvatar src={avSrc} alt={a.memberData?.memberNick ?? ''} size={24} />
						</div>
						<span>{a.memberData?.memberNick ?? 'User'}</span>
					</div>

					<div className="community-card__meta">
						<span><Eye size={13} weight="duotone" /> {a.articleViews}</span>
						<button
							className={`community-card__like${liked ? ' community-card__like--liked' : ''}`}
							onClick={handleLike}
						>
							{liked ? (
								<Heart size={13} weight="fill" color="#e11d48" />
							) : (
								<Heart size={13} weight="regular" color="#9ca3af" />
							)}{' '}
							{likes}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
