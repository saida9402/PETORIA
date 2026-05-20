import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { API_URL } from '../../config';

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
	productStock?: number;
	productStatus?: string;
	meLiked?: { myFavorite: boolean }[];
}

interface Props {
	product: Product;
	onAddCart?: (product: Product) => void;
}

export default function PopularProductCard({ product: p, onAddCart }: Props) {
	const router = useRouter();
	const [liked, setLiked] = useState(p.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(p.productLikes);
	const [added, setAdded] = useState(false);

	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const imgSrc = p.productImages?.[0] ? `${API_URL}/uploads/${p.productImages[0]}` : null;

	const typeCfg = TYPE_CFG[p.productType] ?? { icon: '🐾', label: p.productType, color: 'var(--g700)' };
	const catCfg = CAT_CFG[p.productCategory] ?? { icon: '🦴', label: p.productCategory };

	const isSold = p.productStatus === 'SOLD';

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeProduct({ variables: { input: p._id } });
			setLiked((prev) => !prev);
			setLikes((prev) => (liked ? prev - 1 : prev + 1));
		} catch {}
	};

	const handleAdd = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isSold) return;
		onAddCart?.(p);
		setAdded(true);
		setTimeout(() => setAdded(false), 1200);
	};

	return (
		<div className="popular-product-card" onClick={() => router.push(`/shop/${p._id}`)}>
			{/* Image */}
			<div className="popular-product-card__img-wrap">
				{imgSrc ? (
					<img src={imgSrc} alt={p.productName} className="popular-product-card__img" />
				) : (
					<span className="popular-product-card__emoji">{catCfg.icon}</span>
				)}

				{/* Type badge */}
				<span className="popular-product-card__type-badge" style={{ background: typeCfg.color }}>
					{typeCfg.icon} {typeCfg.label}
				</span>

				{/* Like btn */}
				<button
					className={`popular-product-card__fav${liked ? ' popular-product-card__fav--liked' : ''}`}
					onClick={handleLike}
					aria-label="Like"
				>
					{liked ? '❤️' : '🤍'}
				</button>

				{/* Quick add */}
				{!isSold && (
					<button
						className={`popular-product-card__quick${added ? ' popular-product-card__quick--added' : ''}`}
						onClick={handleAdd}
					>
						{added ? '✓ Added' : '+ Add to cart'}
					</button>
				)}

				{/* Sold overlay */}
				{isSold && <div className="popular-product-card__sold">SOLD OUT</div>}
			</div>

			{/* Body */}
			<div className="popular-product-card__body">
				<p className="popular-product-card__cat">
					{catCfg.icon} {catCfg.label}
				</p>
				<p className="popular-product-card__name">{p.productName}</p>
				<div className="popular-product-card__footer">
					<span className="popular-product-card__price">${p.productPrice.toLocaleString()}</span>
					<div className="popular-product-card__meta">
						<span>♥ {likes}</span>
						<span>👁 {p.productViews}</span>
					</div>
				</div>
				{p.productStock !== undefined && p.productStock <= 5 && !isSold && (
					<div className="popular-product-card__stock">Only {p.productStock} left!</div>
				)}
			</div>
		</div>
	);
}
