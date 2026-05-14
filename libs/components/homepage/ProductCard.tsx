'use client';
import { useState } from 'react';

interface ProductCardProps {
	product: {
		id: string;
		name: string;
		brand: string;
		price: number;
		icon: string;
		likes: number;
		views: number;
	};
	added: boolean;
	onAdd: () => void;
}

const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export default function ProductCard({ product: p, added, onAdd }: ProductCardProps) {
	const [liked, setLiked] = useState(false);
	const [likes, setLikes] = useState(p.likes);

	return (
		<div className="np-card">
			{/* ── Image area ── */}
			<div className="np-card__img-wrap">
				{/* Type badge — top left */}
				<span className="np-card__type-badge">🐾 {p.brand}</span>

				{/* Like button — top right */}
				<button
					className={`np-card__fav${liked ? ' np-card__fav--liked' : ''}`}
					onClick={(e) => {
						e.stopPropagation();
						setLiked((prev) => !prev);
						setLikes((prev) => (liked ? prev - 1 : prev + 1));
					}}
					aria-label="Like"
				>
					{liked ? '❤️' : '🤍'}
				</button>

				{/* Product emoji/image */}
				<div className="np-card__emoji">{p.icon}</div>

				{/* Add to cart overlay on hover */}
				<div className={`np-card__add-overlay${added ? ' np-card__add-overlay--visible' : ''}`}>
					<span>+ Add to cart</span>
				</div>
			</div>

			{/* ── Body ── */}
			<div className="np-card__body">
				<p className="np-card__cat">{p.brand.toUpperCase()}</p>
				<p className="np-card__name">{p.name}</p>
				<hr className="np-card__divider" />
				<div className="np-card__footer">
					<span className="np-card__price">${p.price}</span>
					<div className="np-card__meta">
						<span>🤍 {formatNum(likes)}</span>
						<span>👁 {formatNum(p.views)}</span>
					</div>
					<button
						className="np-card__add-btn"
						onClick={(e) => {
							e.stopPropagation();
							onAdd();
						}}
						aria-label="Add to cart"
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
}
