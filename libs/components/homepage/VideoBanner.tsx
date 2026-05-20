import Link from 'next/link';

export default function VideoBanner() {
	return (
		<section style={{ padding: '56px 0 72px', background: 'var(--pb)' }}>
			<div className="wrap">
				<div className="video-banner">
					{/* CSS background replaces missing video file */}
					<div className="video-banner__bg" aria-hidden="true" />
					<div className="video-banner__overlay">
						<div className="video-banner__content">
							<p className="video-banner__eyebrow">Our mission</p>
							<h2 className="video-banner__title">
								A Happy Life for<br />Every Pet 🌍
							</h2>
							<p className="video-banner__sub">
								We believe happy pets make happy humans. Our ecosystem connects premium
								care, natural nutrition and joyful play.
							</p>
							<div className="video-banner__btns">
								<Link href="/shop" className="btn btn--primary">
									Explore products →
								</Link>
								<Link href="/community" className="btn btn--white">
									Join community
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
