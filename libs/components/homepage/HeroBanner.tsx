import React from 'react';
import Link from 'next/link';

const STATS = [
	{ icon: '🐶', text: '12k+ Products' },
	{ icon: '🚚', text: 'Free Delivery' },
	{ icon: '⭐', text: '4.9 Rating' },
];

const FLOAT_CARDS = [
	{ pos: 'tl', icon: '🍖', title: 'Dog Food', sub: 'Premium Quality' },
	{ pos: 'tr', icon: '✅', title: 'Vet Approved', sub: 'Certified' },
	{ pos: 'bl', icon: '🐱', title: 'Cat Toy', sub: 'New Arrival' },
	{ pos: 'br', icon: '🚚', title: 'Free Ship', sub: 'Over $30' },
];

const HeroBanner = () => {
	return (
		<section className="hero">
			{/* Radial glow overlays */}
			<div className="hero__glow-1" aria-hidden="true" />
			<div className="hero__glow-2" aria-hidden="true" />

			{/* Subtle floating paw prints */}
			<div className="hero__paws" aria-hidden="true">
				{[1, 2, 3, 4, 5].map((n) => (
					<span key={n} className={`hero__paw hero__paw--${n}`}>🐾</span>
				))}
			</div>

			<div className="hero__inner">
				{/* ── LEFT: copy ── */}
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

				{/* ── RIGHT: visual ── */}
				<div className="hero__right">
					<div className="hero__visual">
						<div className="hero__ring hero__ring--1" />
						<div className="hero__ring hero__ring--2" />

						<div className="hero__pet">
							<div className="hero__pet-emoji">🐕</div>
						</div>

						{FLOAT_CARDS.map(({ pos, icon, title, sub }) => (
							<div key={pos} className={`hero__card hero__card--${pos}`}>
								<span className="hero__card-ico">{icon}</span>
								<div className="hero__card-body">
									<strong>{title}</strong>
									<span>{sub}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroBanner;
