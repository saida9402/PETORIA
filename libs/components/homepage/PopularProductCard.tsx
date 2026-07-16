import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Heart, Eye } from 'phosphor-react';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { API_URL } from '../../config';
import { addToCart } from '../../cart';
import { CAT_CFG } from '../../iconConfig';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

// Fallback icon inherits the surrounding font-size/color, matching iconConfig's convention.
const FALLBACK_ICON_SX = { fontSize: 'inherit', verticalAlign: 'middle' } as const;

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

	const imgSrc = p.productImages?.[0] ? (p.productImages[0].startsWith('http') ? p.productImages[0] : `${API_URL}/${p.productImages[0]}`) : null;

	const catCfg = CAT_CFG[p.productCategory] ?? { icon: <ShoppingBagIcon sx={FALLBACK_ICON_SX} />, label: p.productCategory };

	const isSold = p.productStatus === 'SOLD';

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

	const handleAdd = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isSold) return;

		addToCart({
			productId: p._id,
			productName: p.productName,
			productBrand: '',
			productImage: p.productImages?.[0] ?? '',
			productPrice: p.productPrice,
			productType: p.productType,
		});

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

				{/* Like btn */}
				<button
					type="button"
					className={`popular-product-card__fav${liked ? ' popular-product-card__fav--liked' : ''}`}
					onClick={handleLike}
					aria-label="Like"
				>
					{liked ? (
						<Heart size={20} weight="fill" color="#e11d48" />
					) : (
						<Heart size={20} weight="regular" color="#9ca3af" />
					)}
				</button>

				{/* Quick add */}
				{!isSold && (
					<button
						type="button"
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
				<p className="popular-product-card__name">{p.productName}</p>
				<div className="popular-product-card__footer">
					<span className="popular-product-card__price">${p.productPrice.toLocaleString()}</span>
					<div className="popular-product-card__meta">
						<span><Heart size={12} weight="fill" color="#e11d48" /> {likes}</span>
						<span><Eye size={12} weight="duotone" /> {p.productViews}</span>
					</div>
				</div>
				{p.productStock !== undefined && p.productStock <= 5 && !isSold && (
					<div className="popular-product-card__stock">Only {p.productStock} left!</div>
				)}
			</div>
		</div>
	);
}
