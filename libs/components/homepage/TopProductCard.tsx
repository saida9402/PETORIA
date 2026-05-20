import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { API_URL } from '../../config';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';

const TYPE_CFG: Record<string, { icon: string; label: string; color: string }> = {
	DOG: { icon: '🐶', label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: '🐱', label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: '🐦', label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: '🐟', label: 'Fish', color: 'var(--teal)' },
	OTHER: { icon: '🐾', label: 'Other', color: 'var(--g700)' },
};

const CAT_CFG: Record<string, { icon: string; label: string }> = {
	FOOD: { icon: '🍖', label: 'Food' },
	TOY: { icon: '🧸', label: 'Toy' },
	MEDICINE: { icon: '💊', label: 'Medicine' },
	ACCESSORY: { icon: '🦴', label: 'Accessory' },
	OTHER: { icon: '🐾', label: 'Other' },
};

interface Product {
	_id: string;
	productName: string;
	productCategory: string;
	productType: string;
	productPrice: number;
	productImages?: string[];
	productLikes: number;
	productViews: number;
	meLiked?: { myFavorite: boolean }[];
}

interface Props {
	product: Product;
	rank: number;
}

export default function TopProductCard({ product: p, rank }: Props) {
	const router = useRouter();
	const [liked, setLiked] = useState(p.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(p.productLikes);
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const imgSrc = p.productImages?.[0] ? `${API_URL}/uploads/${p.productImages[0]}` : null;
	const catCfg = CAT_CFG[p.productCategory] ?? { icon: '🦴', label: p.productCategory };
	const typeCfg = TYPE_CFG[p.productType] ?? { icon: '🐾', label: p.productType, color: 'var(--g700)' };

	const rankColors = ['#c9952a', '#9ba3af', '#cd7f32'];
	const rankColor = rankColors[rank - 1] ?? 'var(--muted)';

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeProduct({ variables: { input: p._id } });
			setLiked((prev) => !prev);
			setLikes((prev) => (liked ? prev - 1 : prev + 1));
		} catch {}
	};

	return (
		<div className="top-product-card" onClick={() => router.push(`/shop/${p._id}`)}>
			{/* Rank badge */}
			<div className="top-product-card__rank" style={{ color: rankColor, borderColor: rankColor }}>
				#{rank}
			</div>

			{/* Image */}
			<div className="top-product-card__img-wrap">
				{imgSrc ? (
					<img src={imgSrc} alt={p.productName} className="top-product-card__img" />
				) : (
					<span className="top-product-card__emoji">{catCfg.icon}</span>
				)}
				<div className="top-product-card__overlay" />
			</div>

			{/* Body */}
			<div className="top-product-card__body">
				<p className="top-product-card__type" style={{ color: typeCfg.color }}>
					{typeCfg.icon} {typeCfg.label}
				</p>
				<p className="top-product-card__name">{p.productName}</p>
				<div className="top-product-card__footer">
					<span className="top-product-card__price">${p.productPrice.toLocaleString()}</span>
					<button
						className={`top-product-card__like${liked ? ' top-product-card__like--liked' : ''}`}
						onClick={handleLike}
					>
						{liked ? '❤️' : '🤍'} {likes}
					</button>
				</div>
			</div>
		</div>
	);
}
