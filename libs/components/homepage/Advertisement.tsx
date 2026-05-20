import Link from 'next/link';

export default function Advertisement() {
	return (
		<section className="advertisement">
			<div className="wrap">
				{/* Hero banner — CSS background replaces missing video */}
				<div className="advertisement__video-wrap">
					<div className="advertisement__video-bg" aria-hidden="true" />
					<div className="advertisement__video-overlay">
						<div className="advertisement__video-content">
							<p className="advertisement__eyebrow">New collection 2025</p>
							<h2 className="advertisement__title">
								Premium Organic<br />Pet Nutrition 🌿
							</h2>
							<p className="advertisement__sub">
								Grain-free, preservative-free recipes — crafted by veterinary nutritionists
							</p>
							<div className="advertisement__btns">
								<Link href="/shop?cat=FOOD" className="btn btn--primary btn--lg">
									Shop nutrition →
								</Link>
								<Link href="/community?articleCategory=FREE" className="btn btn--white">
									Read the guides
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Two column ad cards */}
				<div className="advertisement__cards">
					<div className="advertisement__card advertisement__card--dark">
						<div className="advertisement__card-content">
							<p className="advertisement__card-eyebrow">For dogs</p>
							<h3 className="advertisement__card-title">Royal Canin<br />Mega Bundle</h3>
							<p className="advertisement__card-sub">Save 25% on 3-month supply</p>
							<Link href="/shop?type=DOG&cat=FOOD" className="btn btn--white btn--sm">
								Shop dogs →
							</Link>
						</div>
						<span className="advertisement__card-emoji" aria-hidden="true">🐶</span>
					</div>

					<div className="advertisement__card advertisement__card--light">
						<div className="advertisement__card-content">
							<p className="advertisement__card-eyebrow">For cats</p>
							<h3 className="advertisement__card-title">Hill's Science<br />Diet Range</h3>
							<p className="advertisement__card-sub">Vet-recommended formula</p>
							<Link href="/shop?type=CAT&cat=FOOD" className="btn btn--primary btn--sm">
								Shop cats →
							</Link>
						</div>
						<span className="advertisement__card-emoji" aria-hidden="true">🐱</span>
					</div>
				</div>
			</div>
		</section>
	);
}
