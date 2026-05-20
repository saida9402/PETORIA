import React from 'react';
import Link from 'next/link';
import { useWeather } from '../../hooks/useWeather';

const STATS = [
	{ icon: '🐶', text: '12k+ Products' },
	{ icon: '🚚', text: 'Free Delivery' },
	{ icon: '⭐', text: '4.9 Rating' },
];

const FLOAT_CARDS = [
	{ pos: 'tl', icon: '🍖', title: 'Dog Food', sub: 'Premium Quality' },
	{ pos: 'tr', icon: '✅', title: 'Vet Approved', sub: 'Certified' },
	{ pos: 'bl', icon: '🐾', title: 'New Arrivals', sub: 'Just Landed' },
	{ pos: 'br', icon: '🚚', title: 'Free Ship', sub: 'Orders over $30' },
];

// Pre-computed particle data (stable across renders, SSR-safe)
const RAIN = Array.from({ length: 24 }, (_, i) => ({
	left: `${(i * 4.2) % 100}%`,
	delay: `${((i * 0.11) % 1.4).toFixed(2)}s`,
	dur: `${(0.5 + (i % 6) * 0.07).toFixed(2)}s`,
	opacity: +(0.18 + (i % 5) * 0.07).toFixed(2),
	height: `${14 + (i % 4) * 5}px`,
}));

const SNOW = Array.from({ length: 20 }, (_, i) => ({
	left: `${(i * 5.1) % 100}%`,
	delay: `${((i * 0.25) % 3.5).toFixed(2)}s`,
	dur: `${(2.8 + (i % 6) * 0.5).toFixed(2)}s`,
	size: `${3 + (i % 4) * 2}px`,
	opacity: +(0.5 + (i % 3) * 0.17).toFixed(2),
}));

const LEAVES = Array.from({ length: 10 }, (_, i) => ({
	left: `${(i * 9.8) % 100}%`,
	delay: `${((i * 0.4) % 3).toFixed(2)}s`,
	dur: `${(3.5 + (i % 5) * 0.9).toFixed(2)}s`,
}));

const SUN_RAYS = Array.from({ length: 6 }, (_, i) => ({
	angle: i * 60,
	delay: `${(i * 0.18).toFixed(2)}s`,
}));

const HeroBanner = () => {
	const { weather, loading } = useWeather();
	// Default to sunny during load — smooth transition once real condition arrives
	const condition = weather?.condition ?? 'sunny';

	return (
		<section
			className={`hero hero--${loading ? 'loading' : 'loaded'}`}
			data-weather={condition}
		>
			{/* Atmospheric glow */}
			<div className="hero__glow-1" aria-hidden="true" />
			<div className="hero__glow-2" aria-hidden="true" />

			{/* ── Real photo: right side ── */}
			<div className="hero__image-wrapper" aria-hidden="true">
				<img
					className="hero__image"
					src="/images/hero/playing-dog-cat.webp"
					alt=""
					draggable={false}
					loading="eager"
				/>
				<div className="hero__overlay" />
			</div>

			{/* ── Weather particles ── */}
			{condition === 'sunny' && (
				<div className="hero__particles hero__particles--sunny" aria-hidden="true">
					{SUN_RAYS.map((r, i) => (
						<span
							key={i}
							className="hero__sun-ray"
							style={{ '--ray-angle': `${r.angle}deg`, animationDelay: r.delay } as React.CSSProperties}
						/>
					))}
				</div>
			)}

			{condition === 'rainy' && (
				<div className="hero__particles hero__particles--rainy" aria-hidden="true">
					{RAIN.map((r, i) => (
						<span
							key={i}
							className="hero__rain-drop"
							style={{
								left: r.left,
								height: r.height,
								opacity: r.opacity,
								animationDelay: r.delay,
								animationDuration: r.dur,
							}}
						/>
					))}
				</div>
			)}

			{condition === 'snowy' && (
				<div className="hero__particles hero__particles--snowy" aria-hidden="true">
					{SNOW.map((s, i) => (
						<span
							key={i}
							className="hero__snow-flake"
							style={{
								left: s.left,
								width: s.size,
								height: s.size,
								opacity: s.opacity,
								animationDelay: s.delay,
								animationDuration: s.dur,
							}}
						/>
					))}
				</div>
			)}

			{condition === 'windy' && (
				<div className="hero__particles hero__particles--windy" aria-hidden="true">
					{LEAVES.map((l, i) => (
						<span
							key={i}
							className="hero__leaf"
							style={{
								left: l.left,
								animationDelay: l.delay,
								animationDuration: l.dur,
							}}
						>
							🍃
						</span>
					))}
				</div>
			)}

			{condition === 'cloudy' && (
				<div className="hero__particles hero__particles--cloudy" aria-hidden="true">
					<span className="hero__cloud hero__cloud--1" />
					<span className="hero__cloud hero__cloud--2" />
					<span className="hero__cloud hero__cloud--3" />
				</div>
			)}

			{/* ── Floating info cards ── */}
			{FLOAT_CARDS.map(({ pos, icon, title, sub }) => (
				<div key={pos} className={`hero__card hero__card--${pos}`}>
					<span className="hero__card-ico">{icon}</span>
					<div className="hero__card-body">
						<strong>{title}</strong>
						<span>{sub}</span>
					</div>
				</div>
			))}

			{/* ── Main content ── */}
			<div className="hero__inner">
				<div className="hero__left">
					<div className="hero__badge">
						<span className="hero__badge-dot" />
						PETORIA PREMIUM CARE
					</div>

					<h1 className="hero__title">
						Healthy Pets,<br />
						<span>Happy Life.</span>
					</h1>

					<p className="hero__sub">
						Premium food, toys, medicine and accessories<br />
						for your lovely pets.
					</p>

					<div className="hero__actions">
						<Link href="/shop">
							<button className="hero__btn hero__btn--primary">Shop Now →</button>
						</Link>
						<Link href="/about">
							<button className="hero__btn hero__btn--outline">Explore Brands</button>
						</Link>
					</div>

					<div className="hero__stats">
						{STATS.map(({ icon, text }, i) => (
							<React.Fragment key={text}>
								<div className="hero__stat">
									<span className="hero__stat-icon">{icon}</span>
									<span className="hero__stat-text">{text}</span>
								</div>
								{i < STATS.length - 1 && <div className="hero__stat-sep" />}
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroBanner;
