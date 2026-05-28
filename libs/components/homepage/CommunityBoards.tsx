import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import CommunityCard from './CommunityCard';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';

const TABS = [
	{ key: 'ALL', icon: '📋', label: 'All' },
	{ key: 'NEWS', icon: '📰', label: 'News' },
	{ key: 'RECOMMEND', icon: '💡', label: 'Tips' },
	{ key: 'FREE', icon: '💬', label: 'Health' },
	{ key: 'HUMOR', icon: '😄', label: 'Stories' },
];

export default function CommunityBoards() {
	const [activeCategory, setActiveCategory] = useState('ALL');

	const { data, loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					...(activeCategory !== 'ALL' ? { articleCategory: activeCategory } : {}),
				},
			},
		},
	});

	const articles: any[] = data?.getBoardArticles?.list ?? [];

	return (
		<section className="community-boards">
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Community</p>
						<h2 className="section-hd__title">Community Boards</h2>
						<p className="section-hd__sub">Tips, news and stories from fellow pet owners</p>
					</div>
					<Link href="/board" className="section-hd__link">
						Read all articles →
					</Link>
				</div>

				{/* Category chips */}
				<div className="community-boards__cats">
					{TABS.map((c) => (
						<button
							key={c.key}
							onClick={() => setActiveCategory(c.key)}
							className={`chip${activeCategory === c.key ? ' chip--active' : ''}`}
						>
							{c.icon} {c.label}
						</button>
					))}
				</div>

				{loading ? (
					<div className="community-boards__grid">
						{Array(6)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r16)' }} />
							))}
					</div>
				) : articles.length === 0 ? (
					<div className="empty">
						<div className="empty__icon">📰</div>
						<div className="empty__title">No articles found</div>
					</div>
				) : (
					<div className="community-boards__grid">
						{articles.slice(0, 6).map((a: any) => (
							<CommunityCard key={a._id} article={a} />
						))}
					</div>
				)}

				{/* Write CTA */}
				<div className="community-boards__cta">
					<div className="community-boards__cta-text">
						<span className="community-boards__cta-icon">✍️</span>
						<div>
							<p style={{ fontWeight: 700, color: 'var(--g800)', marginBottom: 2 }}>Share your pet story</p>
							<p style={{ fontSize: 13, color: 'var(--muted)' }}>Help fellow pet owners with your experience</p>
						</div>
					</div>
					<Link href="/board" className="btn btn--outline btn--sm">
						Write an article →
					</Link>
				</div>
			</div>
		</section>
	);
}
