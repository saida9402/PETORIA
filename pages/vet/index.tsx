import React, { useState } from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import Link from 'next/link';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/* ─── Static mock data ─────────────────────────────────────────────────────── */

const CLINICS = [
	{
		id: 'c1',
		name: 'Green Paws Animal Hospital',
		type: 'Full-service clinic',
		address: '12 Teheran-ro, Gangnam-gu',
		distance: '0.4 km',
		rating: 4.9,
		reviews: 312,
		hours: 'Mon–Sat 09:00–20:00',
		emergency: true,
		tags: ['Dogs', 'Cats', 'Surgery'],
		icon: '🏥',
		phone: '+821012345678',
	},
	{
		id: 'c2',
		name: 'Happy Pets Vet Clinic',
		type: 'General practice',
		address: '88 Apgujeong-ro, Gangnam-gu',
		distance: '1.2 km',
		rating: 4.7,
		reviews: 198,
		hours: 'Mon–Fri 10:00–18:00',
		emergency: false,
		tags: ['Dogs', 'Cats', 'Birds'],
		icon: '🩺',
		phone: '+821098765432',
	},
	{
		id: 'c3',
		name: 'Seoul Exotic Animal Center',
		type: 'Exotic specialist',
		address: '35 Hongik-ro, Mapo-gu',
		distance: '2.8 km',
		rating: 4.8,
		reviews: 145,
		hours: 'Tue–Sun 11:00–19:00',
		emergency: false,
		tags: ['Reptiles', 'Birds', 'Rabbits'],
		icon: '🦎',
		phone: '+821055556666',
	},
	{
		id: 'c4',
		name: 'PetCare 24H Emergency',
		type: '24-hour emergency',
		address: '7 Itaewon-daero, Yongsan-gu',
		distance: '3.1 km',
		rating: 4.6,
		reviews: 421,
		hours: 'Open 24 hours',
		emergency: true,
		tags: ['Emergency', 'Surgery', 'ICU'],
		icon: '🚑',
		phone: '+821012345678',
	},
];

const ZOOS = [
	{
		id: 'z1',
		name: 'Seoul Grand Park Zoo',
		type: 'City zoo',
		address: 'Seoul Grand Park, Gwacheon',
		distance: '14 km',
		rating: 4.5,
		reviews: 3200,
		hours: 'Daily 09:00–17:00',
		price: '₩5,000',
		icon: '🦁',
		mapQuery: 'Seoul Grand Park Zoo Seoul Grand Park Gwacheon',
	},
	{
		id: 'z2',
		name: 'Everland Animal Kingdom',
		type: 'Theme park + zoo',
		address: 'Everland, Yongin',
		distance: '38 km',
		rating: 4.8,
		reviews: 8900,
		hours: 'Daily 10:00–18:00',
		price: '₩39,000',
		icon: '🎡',
		mapQuery: 'Everland Animal Kingdom Everland Yongin',
	},
];

const ZOO_CAFES = [
	{
		id: 'zc1',
		name: 'Meow Brewers',
		type: 'Cat café',
		address: '44 Insadong-gil, Jongno-gu',
		distance: '4.2 km',
		rating: 4.6,
		reviews: 760,
		price: '₩12,000',
		icon: '🐱',
		mapQuery: 'Meow Brewers 44 Insadong-gil Jongno-gu',
	},
	{
		id: 'zc2',
		name: 'Bau House Dog Café',
		type: 'Dog café',
		address: '102 Hongdae-ro, Mapo-gu',
		distance: '3.9 km',
		rating: 4.4,
		reviews: 530,
		price: '₩10,000',
		icon: '🐶',
		mapQuery: 'Bau House Dog Cafe 102 Hongdae-ro Mapo-gu',
	},
	{
		id: 'zc3',
		name: 'Owl Village',
		type: 'Owl café',
		address: '19 Myeongdong-gil, Jung-gu',
		distance: '5.1 km',
		rating: 4.3,
		reviews: 280,
		price: '₩15,000',
		icon: '🦉',
		mapQuery: 'Owl Village 19 Myeongdong-gil Jung-gu',
	},
];

const TABS = [
	{ id: 'clinics',   label: '🏥 Vet Clinics' },
	{ id: 'zoos',      label: '🦁 Zoos & Parks' },
	{ id: 'cafes',     label: '☕ Zoo Cafés' },
	{ id: 'emergency', label: '🚨 Emergency' },
];

/* ─── Star rating helper ────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
	const full = Math.floor(rating);
	const half = rating - full >= 0.5;
	return (
		<span className="vet-stars">
			{'★'.repeat(full)}
			{half ? '½' : ''}
			{'☆'.repeat(5 - full - (half ? 1 : 0))}
			<span className="vet-stars__num">{rating}</span>
		</span>
	);
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
const VetPage: NextPage = () => {
	const device = useDeviceDetect();
	const [tab, setTab] = useState('clinics');

	if (device === 'mobile') {
		return <div style={{ padding: 24 }}><h2>Vets &amp; Zoo</h2><p>Mobile view coming soon.</p></div>;
	}

	return (
		<Stack className="vet-page">
			<div className="wrap">

				{/* Emergency alert banner */}
				<div className="vet-emergency-bar">
					<span className="vet-emergency-bar__icon">🚨</span>
					<strong>Pet Emergency?</strong>
					<span>PetCare 24H is open now —</span>
					<a href="tel:+821012345678">📞 010-1234-5678</a>
					<span className="vet-emergency-bar__sep">·</span>
					<Link href="#emergency" onClick={() => setTab('emergency')} className="vet-emergency-bar__link">
						Find emergency clinics →
					</Link>
				</div>

				{/* Stats strip */}
				<div className="vet-stats">
					{[
						{ icon: '🏥', val: '120+', label: 'Partner Clinics' },
						{ icon: '👨‍⚕️', val: '350+', label: 'Licensed Vets' },
						{ icon: '⭐', val: '4.8',  label: 'Avg. Rating' },
						{ icon: '🐾', val: '50K+', label: 'Pets Helped' },
					].map((s) => (
						<div key={s.label} className="vet-stat">
							<span className="vet-stat__icon">{s.icon}</span>
							<strong className="vet-stat__val">{s.val}</strong>
							<span className="vet-stat__label">{s.label}</span>
						</div>
					))}
				</div>

				{/* Tabs */}
				<div className="vet-tabs">
					{TABS.map((t) => (
						<button
							key={t.id}
							className={`vet-tab${tab === t.id ? ' vet-tab--active' : ''}`}
							onClick={() => setTab(t.id)}
						>
							{t.label}
						</button>
					))}
				</div>

				{/* ── Vet Clinics ── */}
				{tab === 'clinics' && (
					<section id="clinics">
						<h2 className="vet-section-title">Veterinary Clinics Near You</h2>
						<div className="vet-grid vet-grid--2">
							{CLINICS.map((c) => (
								<div key={c.id} className="vet-card">
									<div className="vet-card__head">
										<span className="vet-card__icon">{c.icon}</span>
										<div className="vet-card__head-info">
											<h3 className="vet-card__name">{c.name}</h3>
											<p className="vet-card__type">{c.type}</p>
										</div>
										{c.emergency && <span className="vet-badge vet-badge--emergency">24H ER</span>}
									</div>
									<div className="vet-card__body">
										<p className="vet-card__meta">📍 {c.address}</p>
										<p className="vet-card__meta">🕐 {c.hours}</p>
										<p className="vet-card__meta">
											<Stars rating={c.rating} />
											<span className="vet-card__reviews">({c.reviews} reviews)</span>
										</p>
										<div className="vet-card__tags">
											{c.tags.map((tag) => (
												<span key={tag} className="vet-tag">{tag}</span>
											))}
										</div>
									</div>
									<div className="vet-card__foot">
										<span className="vet-card__distance">📌 {c.distance}</span>
										<a href={`tel:${c.phone}`} className="btn btn--primary btn--sm">Book visit →</a>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{/* ── Zoos & Parks ── */}
				{tab === 'zoos' && (
					<section id="zoos">
						<h2 className="vet-section-title">Zoos &amp; Animal Parks</h2>
						<div className="vet-grid vet-grid--2">
							{ZOOS.map((z) => (
								<div key={z.id} className="vet-card vet-card--zoo">
									<div className="vet-card__head">
										<span className="vet-card__icon">{z.icon}</span>
										<div className="vet-card__head-info">
											<h3 className="vet-card__name">{z.name}</h3>
											<p className="vet-card__type">{z.type}</p>
										</div>
										<span className="vet-badge vet-badge--price">{z.price}</span>
									</div>
									<div className="vet-card__body">
										<p className="vet-card__meta">📍 {z.address}</p>
										<p className="vet-card__meta">🕐 {z.hours}</p>
										<p className="vet-card__meta">
											<Stars rating={z.rating} />
											<span className="vet-card__reviews">({z.reviews} reviews)</span>
										</p>
									</div>
									<div className="vet-card__foot">
										<span className="vet-card__distance">📌 {z.distance}</span>
										<a href={`https://maps.google.com/?q=${encodeURIComponent(z.address)}`} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">Get directions →</a>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{/* ── Zoo Cafés ── */}
				{tab === 'cafes' && (
					<section id="cafes">
						<h2 className="vet-section-title">Zoo Cafés &amp; Pet Experiences</h2>
						<div className="vet-grid vet-grid--3">
							{ZOO_CAFES.map((z) => (
								<div key={z.id} className="vet-card vet-card--cafe">
									<div className="vet-card__cafe-icon">{z.icon}</div>
									<h3 className="vet-card__name">{z.name}</h3>
									<p className="vet-card__type">{z.type}</p>
									<p className="vet-card__meta">📍 {z.address}</p>
									<p className="vet-card__meta">
										<Stars rating={z.rating} />
										<span className="vet-card__reviews">({z.reviews})</span>
									</p>
									<div className="vet-card__foot">
										<span className="vet-badge vet-badge--price">{z.price}</span>
										<a href={`https://maps.google.com/?q=${encodeURIComponent(z.address)}`} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">Visit →</a>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{/* ── Emergency ── */}
				{tab === 'emergency' && (
					<section id="emergency">
						<h2 className="vet-section-title">🚨 Emergency Vet Services</h2>
						<div className="vet-emergency-card">
							<div className="vet-emergency-card__icon">🚑</div>
							<div>
								<h3>PetCare 24H Emergency Clinic</h3>
								<p>7 Itaewon-daero, Yongsan-gu · <strong>Open 24 hours, 365 days</strong></p>
								<p>Full ICU, surgery, critical care for all animals.</p>
								<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
									<a href="tel:+821012345678" className="btn btn--danger">📞 Call now</a>
									<a href="https://maps.google.com/?q=7+Itaewon-daero+Yongsan-gu+Seoul" target="_blank" rel="noopener noreferrer" className="btn btn--outline">Get directions →</a>
								</div>
							</div>
						</div>

						<div className="vet-tips">
							<h3 className="vet-tips__title">⚠️ Pet Emergency Checklist</h3>
							<ul className="vet-tips__list">
								{[
									'Stay calm — your pet senses your anxiety',
									'Do not give human medications to your pet',
									'Keep your pet warm and still during transport',
									'Bring the vet record and any medications your pet takes',
									'Call ahead so the clinic can prepare for your arrival',
								].map((tip) => (
									<li key={tip}>{tip}</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{/* CTA */}
				<div className="vet-cta">
					<div className="vet-cta__content">
						<h2>Can't find what you're looking for?</h2>
						<p>Contact our support team and we'll connect you with the right specialist.</p>
					</div>
					<Link href="/cs" className="btn btn--primary">Contact Support →</Link>
				</div>

			</div>
		</Stack>
	);
};

export default withLayoutBasic(VetPage);
