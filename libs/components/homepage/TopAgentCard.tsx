'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { API_URL } from '../../config';

interface Seller {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberPhone?: string;
	memberDesc?: string;
	memberLikes?: number;
	memberViews?: number;
	memberArticles?: number;
	meFollowed?: { myFollowing: boolean }[];
}

interface Props {
	seller: Seller;
	rank?: number;
}

export default function TopAgentCard({ seller: s, rank }: Props) {
	const router = useRouter();
	const [following, setFollowing] = useState(s.meFollowed?.[0]?.myFollowing ?? false);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const imgSrc = s.memberImage ? `${API_URL}/uploads/${s.memberImage}` : null;

	const handleFollow = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			if (following) {
				await unsubscribe({ variables: { input: s._id } });
			} else {
				await subscribe({ variables: { input: s._id } });
			}
			setFollowing((prev) => !prev);
		} catch {}
	};

	return (
		<div className="top-agent-card" onClick={() => router.push(`/member/${s._id}`)}>
			{rank && rank <= 3 && (
				<div
					className="top-agent-card__rank-badge"
					style={{ background: rank === 1 ? '#c9952a' : rank === 2 ? '#9ba3af' : '#cd7f32' }}
				>
					#{rank}
				</div>
			)}

			{/* Avatar */}
			<div className="top-agent-card__avatar">
				{imgSrc ? <img src={imgSrc} alt={s.memberNick} /> : <span>{s.memberNick[0]?.toUpperCase()}</span>}
			</div>

			<div className="top-agent-card__name">{s.memberNick}</div>
			{s.memberDesc && (
				<p className="top-agent-card__desc">
					{s.memberDesc.slice(0, 50)}
					{s.memberDesc.length > 50 ? '…' : ''}
				</p>
			)}

			{/* Stats */}
			<div className="top-agent-card__stats">
				<div className="top-agent-card__stat">
					<span className="top-agent-card__stat-num">{s.memberLikes ?? 0}</span>
					<span className="top-agent-card__stat-label">Likes</span>
				</div>
				<div className="top-agent-card__stat-div" />
				<div className="top-agent-card__stat">
					<span className="top-agent-card__stat-num">{s.memberViews ?? 0}</span>
					<span className="top-agent-card__stat-label">Views</span>
				</div>
				<div className="top-agent-card__stat-div" />
				<div className="top-agent-card__stat">
					<span className="top-agent-card__stat-num">{s.memberArticles ?? 0}</span>
					<span className="top-agent-card__stat-label">Articles</span>
				</div>
			</div>

			{/* Follow btn */}
			<button
				className={`top-agent-card__follow btn btn--sm ${following ? 'btn--ghost' : 'btn--outline'}`}
				onClick={handleFollow}
			>
				{following ? 'Following ✓' : '+ Follow'}
			</button>
		</div>
	);
}
