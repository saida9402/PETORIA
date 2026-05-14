'use client';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import TopAgentCard from './TopAgentCard';
import { GET_SELLERS } from '../../../apollo/user/query';

const MOCK_SELLERS = [
	{
		_id: 's1',
		memberNick: 'PetGuruSeoul',
		memberImage: undefined,
		memberDesc: 'Specializing in premium dog food and supplements.',
		memberLikes: 234,
		memberViews: 1890,
		memberArticles: 12,
	},
	{
		_id: 's2',
		memberNick: 'CatLoverKim',
		memberImage: undefined,
		memberDesc: 'Cat nutrition expert. 8 years of experience.',
		memberLikes: 189,
		memberViews: 1234,
		memberArticles: 8,
	},
	{
		_id: 's3',
		memberNick: 'PawsNaturals',
		memberImage: undefined,
		memberDesc: 'Organic and natural pet products only.',
		memberLikes: 156,
		memberViews: 987,
		memberArticles: 15,
	},
	{
		_id: 's4',
		memberNick: 'BirdWorldJeju',
		memberImage: undefined,
		memberDesc: "Korea's leading exotic bird supplies seller.",
		memberLikes: 98,
		memberViews: 756,
		memberArticles: 6,
	},
	{
		_id: 's5',
		memberNick: 'AquaPetBusan',
		memberImage: undefined,
		memberDesc: 'Freshwater and marine aquarium specialists.',
		memberLikes: 76,
		memberViews: 543,
		memberArticles: 4,
	},
	{
		_id: 's6',
		memberNick: 'VetTipsHana',
		memberImage: undefined,
		memberDesc: 'Certified vet tech. Honest reviews & advice.',
		memberLikes: 312,
		memberViews: 2450,
		memberArticles: 22,
	},
];

export default function TopAgents() {
	const { data, loading } = useQuery(GET_SELLERS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 6, sort: 'memberLikes', search: {} },
		},
	});

	const sellers = (data?.getSeller?.list?.length ? data.getSeller.list : MOCK_SELLERS).slice(0, 6);

	return (
		<section className="top-agents">
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Our experts</p>
						<h2 className="section-hd__title">Top Sellers</h2>
						<p className="section-hd__sub">Verified sellers trusted by the community</p>
					</div>
					<Link href="/agents" className="section-hd__link">
						View all sellers →
					</Link>
				</div>

				{loading ? (
					<div className="top-agents__grid">
						{Array(6)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--r20)' }} />
							))}
					</div>
				) : (
					<div className="top-agents__grid">
						{sellers.map((s: any, i: number) => (
							<TopAgentCard key={s._id} seller={s} rank={i + 1} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
