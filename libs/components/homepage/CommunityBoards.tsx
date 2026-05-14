'use client';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import CommunityCard from './CommunityCard';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';

const CATEGORIES = [
	{ key: 'ALL', icon: '📋', label: 'All' },
	{ key: 'NEWS', icon: '📰', label: 'News' },
	{ key: 'TIP', icon: '💡', label: 'Tips' },
	{ key: 'HEALTH', icon: '🩺', label: 'Health' },
	{ key: 'NUTRITION', icon: '🥗', label: 'Nutrition' },
	{ key: 'STORY', icon: '🐾', label: 'Stories' },
];

const MOCK_ARTICLES = [
	{
		_id: 'a1',
		articleTitle: 'Best nutrition for senior dogs — complete guide',
		articleCategory: 'NUTRITION',
		articleLikes: 189,
		articleViews: 2341,
		createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
		memberData: { memberNick: 'DrSmith_Vet', memberImage: undefined },
		articleContent: 'Senior dogs require special dietary...',
	},
	{
		_id: 'a2',
		articleTitle: '5 ways to reduce cat shedding this spring',
		articleCategory: 'TIP',
		articleLikes: 234,
		articleViews: 1890,
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
		memberData: { memberNick: 'CatLoverKim', memberImage: undefined },
		articleContent: 'Spring is here and so is cat shedding...',
	},
	{
		_id: 'a3',
		articleTitle: 'New Seoul pet-friendly parks opened in 2025',
		articleCategory: 'NEWS',
		articleLikes: 156,
		articleViews: 3100,
		createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
		memberData: { memberNick: 'PetNewsKorea', memberImage: undefined },
		articleContent: 'The Seoul city government has announced...',
	},
	{
		_id: 'a4',
		articleTitle: "My golden retriever's first agility win! 🏆",
		articleCategory: 'STORY',
		articleLikes: 301,
		articleViews: 1450,
		createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
		memberData: { memberNick: 'BuddysDad', memberImage: undefined },
		articleContent: 'After six months of training...',
	},
	{
		_id: 'a5',
		articleTitle: 'Essential spring vaccinations for your pets',
		articleCategory: 'HEALTH',
		articleLikes: 412,
		articleViews: 3100,
		createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
		memberData: { memberNick: 'HealthyPets', memberImage: undefined },
		articleContent: 'Spring brings new environmental risks...',
	},
	{
		_id: 'a6',
		articleTitle: 'Natural homemade cat food recipes — vet approved',
		articleCategory: 'NUTRITION',
		articleLikes: 78,
		articleViews: 967,
		createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
		memberData: { memberNick: 'NutriPet', memberImage: undefined },
		articleContent: 'Three nutritionists share their recipes...',
	},
];

export default function CommunityBoards() {
	const [activeCategory, setActiveCategory] = useState('ALL');

	const { data, loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'articleLikes',
				search: {
					...(activeCategory !== 'ALL' ? { articleCategory: activeCategory } : {}),
				},
			},
		},
	});

	const articles = (data?.getBoardArticles?.list?.length ? data.getBoardArticles.list : MOCK_ARTICLES).filter(
		(a: any) => activeCategory === 'ALL' || a.articleCategory === activeCategory,
	);

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
					{CATEGORIES.map((c) => (
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
