import { useState } from 'react';
import { useRouter } from 'next/router';
import { ProductType, ProductCategory } from '../../enums/product.enum';

const TYPES = Object.values(ProductType);
const CATEGORIES = Object.values(ProductCategory);

const TYPE_LABEL: Record<string, string> = {
	DOG: 'Dogs',
	CAT: 'Cats',
	BIRD: 'Birds',
	FISH: 'Fish',
};

const CAT_LABEL: Record<string, string> = {
	FOOD: 'Food',
	MEDICINE: 'Medicine',
	ACCESSORY: 'Accessories',
	TOY: 'Toys',
	STROLLER: 'Stroller',
};

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
								{TYPE_LABEL[t] ?? (t[0] + t.slice(1).toLowerCase())}
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
								{CAT_LABEL[c] ?? (c[0] + c.slice(1).toLowerCase())}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
