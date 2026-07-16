import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Heart } from 'phosphor-react';
import PetsIcon from '@mui/icons-material/Pets';
import { API_URL } from '../../config';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';

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

	const imgSrc = p.productImages?.[0] ? (p.productImages[0].startsWith('http') ? p.productImages[0] : `${API_URL}/${p.productImages[0]}`) : null;

	const rankColors = ['#c9952a', '#9ba3af', '#cd7f32'];
	const rankColor = rankColors[rank - 1] ?? 'var(--muted)';

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await likeProduct({ variables: { input: p._id } });
			setLiked((prev) => !prev);
			setLikes((prev) => (liked ? prev - 1 : prev + 1));
		} catch (err) {
			console.error(err);
		}
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
					<span className="top-product-card__emoji"><PetsIcon sx={{ fontSize: 'inherit' }} /></span>
				)}
				<div className="top-product-card__overlay" />
			</div>

			{/* Body */}
			<div className="top-product-card__body">
				<p className="top-product-card__name">{p.productName}</p>
				<div className="top-product-card__footer">
					<span className="top-product-card__price">${p.productPrice.toLocaleString()}</span>
					<button
						className={`top-product-card__like${liked ? ' top-product-card__like--liked' : ''}`}
						onClick={handleLike}
					>
						{liked ? (
							<Heart size={14} weight="fill" color="#e11d48" />
						) : (
							<Heart size={14} weight="regular" color="#9ca3af" />
						)}{' '}
						{likes}
					</button>
				</div>
			</div>
		</div>
	);
}
