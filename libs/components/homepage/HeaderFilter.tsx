import { useState } from 'react';
import { useRouter } from 'next/router';
import { ProductType, ProductCategory } from '../../enums/product.enum';

const TYPE_ICON: Record<string, string> = { DOG: '🐶', CAT: '🐱', BIRD: '🐦', FISH: '🐠' };
const CAT_ICON: Record<string, string> = { FOOD: '🍖', MEDICINE: '💊', ACCESSORY: '🎀', TOY: '🎾' };

const TYPES = Object.values(ProductType);
const CATEGORIES = Object.values(ProductCategory);

export default function HeaderFilter() {
	const router = useRouter();
	const [keyword, setKeyword] = useState('');
	const [type, setType] = useState('');
	const [category, setCategory] = useState('');

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (keyword) params.set('text', keyword);
		if (type) params.set('type', type);
		if (category) params.set('cat', category);
		router.push(`/shop?${params.toString()}`);
	};

	const handleKey = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleSearch();
	};

	const clear = () => {
		setKeyword('');
		setType('');
		setCategory('');
	};

	const hasFilter = keyword || type || category;

	return (
		<div className="filter-card">
			{/* Search row */}
			<div className="filter-card__search">
				<span className="filter-card__search-ico">🔍</span>
				<input
					className="filter-card__search-input"
					placeholder="Search products, brands..."
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					onKeyDown={handleKey}
				/>
				{hasFilter && (
					<button className="filter-card__clear" onClick={clear} aria-label="Clear filters">
						✕
					</button>
				)}
				<button className="filter-card__search-btn" onClick={handleSearch}>
					Search
				</button>
			</div>

			{/* Filter chips row */}
			<div className="filter-card__row">
				{/* Pet Type */}
				<div className="filter-card__group">
					<span className="filter-card__label">Pet Type</span>
					<div className="filter-card__chips">
						{TYPES.map((t) => (
							<button
								key={t}
								className={`fchip${type === t ? ' fchip--on' : ''}`}
								onClick={() => setType((prev) => (prev === t ? '' : t))}
							>
								{TYPE_ICON[t]} {t[0] + t.slice(1).toLowerCase()}
							</button>
						))}
					</div>
				</div>

				<div className="filter-card__sep" />

				{/* Category */}
				<div className="filter-card__group">
					<span className="filter-card__label">Category</span>
					<div className="filter-card__chips">
						{CATEGORIES.map((c) => (
							<button
								key={c}
								className={`fchip${category === c ? ' fchip--on' : ''}`}
								onClick={() => setCategory((prev) => (prev === c ? '' : c))}
							>
								{CAT_ICON[c]} {c[0] + c.slice(1).toLowerCase()}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
