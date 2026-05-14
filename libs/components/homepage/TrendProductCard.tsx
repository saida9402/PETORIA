'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { API_URL, CAT_CFG, TYPE_CFG } from '../../config';

interface Product {
	_id: string;
	productName: string;
	productCategory: string;
	productType: string;
	productPrice: number;
	productImages?: string[];
	productLikes: number;
	productViews: number;
	createdAt: string;
	meLiked?: { myFavorite: boolean }[];
}

interface Props {
	product: Product;
	onAddCart?: (product: Product) => void;
}

export default function TrendProductCard({ product: p, onAddCart }: Props) {
	const router = useRouter();
	const [liked, setLiked] = useState(p.meLiked?.[0]?.myFavorite ?? false);
	const [likes, setLikes] = useState(p.productLikes);
	const [added, setAdded] = useState(false);
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const imgSrc = p.productImages?.[0] ? `${API_URL}/uploads/${p.productImages[0]}` : null;
	const catCfg = CAT_CFG[p.productCategory] ?? { icon: '🦴', label: p.productCategory };
	const typeCfg = TYPE_CFG[p.productType] ?? { icon: '🐾', label: p.productType, color: 'var(--g700)' };

	const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86_400_000);
	const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

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
		onAddCart?.(p);
		setAdded(true);
		setTimeout(() => setAdded(false), 1200);
	};

	return (
		<div className="trend-product-card" onClick={() => router.push(`/shop/${p._id}`)}>
			{/* Image */}
			<div className="trend-product-card__img-wrap">
				{imgSrc ? (
					<img src={imgSrc} alt={p.productName} className="trend-product-card__img" />
				) : (
					<span className="trend-product-card__emoji">{catCfg.icon}</span>
				)}
				<span className="badge badge--new" style={{ position: 'absolute', top: 10, left: 10, fontSize: 10 }}>
					New
				</span>
			</div>

			{/* Body */}
			<div className="trend-product-card__body">
				<div className="trend-product-card__top">
					<span className="trend-product-card__type" style={{ color: typeCfg.color }}>
						{typeCfg.icon} {typeCfg.label}
					</span>
					<span className="trend-product-card__time">{timeLabel}</span>
				</div>
				<p className="trend-product-card__name">{p.productName}</p>
				<p className="trend-product-card__cat">
					{catCfg.icon} {catCfg.label}
				</p>
				<div className="trend-product-card__footer">
					<span className="trend-product-card__price">${p.productPrice.toLocaleString()}</span>
					<div className="trend-product-card__actions">
						<button
							className={`trend-product-card__like${liked ? ' trend-product-card__like--liked' : ''}`}
							onClick={handleLike}
						>
							{liked ? '❤️' : '🤍'} {likes}
						</button>
						<button
							className={`trend-product-card__add${added ? ' trend-product-card__add--added' : ''}`}
							onClick={handleAdd}
						>
							{added ? '✓' : '+'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
