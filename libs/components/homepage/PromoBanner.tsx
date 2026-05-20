import Link from 'next/link';

export default function PromoBanner() {
	return (
		<section className="promo-section">
			<div className="wrap">
				<div className="promo-banner">
					<div className="promo-banner__content">
						<p className="promo-banner__label">Limited offer</p>
						<h2 className="promo-banner__title">Free delivery on<br />your first order 🚚</h2>
						<p className="promo-banner__sub">
							Sign up today — free shipping + 10% off. No minimum order required.
						</p>
						<div className="promo-banner__btns">
							<Link href="/account/join" className="btn btn--gold btn--lg">
								Create free account →
							</Link>
							<Link href="/shop" className="btn btn--white btn--lg">
								Browse products
							</Link>
						</div>
					</div>
					<div className="promo-banner__emoji" aria-hidden="true">🐾</div>
				</div>
			</div>
		</section>
	);
}
