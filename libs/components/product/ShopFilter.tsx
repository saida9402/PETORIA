import React, { useState } from 'react';
import { Checkbox, Slider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCategory, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';

interface ShopFilterProps {
	initialInput: ProductsInquiry;
	searchFilter: ProductsInquiry;
	setSearchFilter: (input: ProductsInquiry) => void;
}

const PET_TYPES = [
	{ value: ProductType.DOG,  label: '🐶 Dogs' },
	{ value: ProductType.CAT,  label: '🐱 Cats' },
	{ value: ProductType.BIRD, label: '🦜 Birds' },
	{ value: ProductType.FISH, label: '🐠 Fish' },
];

const CATEGORIES = [
	{ value: ProductCategory.FOOD,      label: '🍖 Food' },
	{ value: ProductCategory.MEDICINE,  label: '💊 Medicine' },
	{ value: ProductCategory.ACCESSORY, label: '🎀 Accessories' },
	{ value: ProductCategory.TOY,       label: '🎾 Toys' },
];

const BRANDS = [
	'Royal Canin', "Hill's", 'Orijen', 'Purina Pro', 'Acana',
	'Pedigree', 'Whiskas', 'Kong', 'Frontline', 'Zymox',
];

const SIZES = [
	{ value: 'XS',   label: 'XS' },
	{ value: 'S',    label: 'S' },
	{ value: 'M',    label: 'M' },
	{ value: 'L',    label: 'L' },
	{ value: 'XL',   label: 'XL' },
	{ value: '1KG',  label: '1 kg' },
	{ value: '3KG',  label: '3 kg' },
	{ value: '5KG',  label: '5 kg' },
	{ value: '10KG', label: '10 kg' },
	{ value: '20KG', label: '20 kg' },
];

const VISIBLE_BRANDS = 5;

const CheckRow = ({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
}) => (
	<div className="filter-item">
		<Checkbox
			size="small"
			checked={checked}
			onChange={(e) => onChange(e.target.checked)}
			sx={{
				padding: '3px 6px',
				color: '#C8E6A0',
				'&.Mui-checked': { color: '#4E8A28' },
				flexShrink: 0,
			}}
		/>
		<span className="filter-item__label">{label}</span>
	</div>
);

const ShopFilter = ({ initialInput, searchFilter, setSearchFilter }: ShopFilterProps) => {
	const device = useDeviceDetect();
	const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
	const [showAllBrands, setShowAllBrands] = useState(false);
	const [selectedSize, setSelectedSize] = useState<string>('');

	const typeHandler = (type: ProductType, checked: boolean) => {
		const cur = searchFilter.search.typeList ?? [];
		const next = checked ? [...cur, type] : cur.filter((t) => t !== type);
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, typeList: next.length ? next : undefined } });
	};

	const categoryHandler = (cat: ProductCategory, checked: boolean) => {
		const cur = searchFilter.search.categoryList ?? [];
		const next = checked ? [...cur, cat] : cur.filter((c) => c !== cat);
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, categoryList: next.length ? next : undefined } });
	};

	const brandHandler = (brand: string, checked: boolean) => {
		const cur = searchFilter.search.brandList ?? [];
		const next = checked ? [...cur, brand] : cur.filter((b) => b !== brand);
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, brandList: next.length ? next : undefined } });
	};

	const sizeHandler = (size: string, checked: boolean) => {
		const newSize = checked ? size : '';
		setSelectedSize(newSize);
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: newSize || undefined } });
	};

	const priceHandler = (_: Event, val: number | number[]) => {
		setPriceRange(val as number[]);
	};

	const priceCommitHandler = (_: any, val: number | number[]) => {
		const [start, end] = val as number[];
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, pricesRange: { start, end } } });
	};

	const saleHandler = (checked: boolean) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, onSale: checked || undefined } });
	};

	const resetHandler = () => {
		setSearchFilter(initialInput);
		setPriceRange([0, 500]);
		setShowAllBrands(false);
		setSelectedSize('');
	};

	const visibleBrands = showAllBrands ? BRANDS : BRANDS.slice(0, VISIBLE_BRANDS);

	if (device === 'mobile') {
		return <div>SHOP FILTER MOBILE</div>;
	}

	return (
		<div className="shop-filter">

			{/* Header */}
			<div className="sf-header">
				<span className="sf-header__title">🔧 Filters</span>
				<button className="sf-header__reset" onClick={resetHandler}>Reset</button>
			</div>

			{/* Pet Type */}
			<div className="filter-section">
				<p className="filter-section__title">🐾 Pet Type</p>
				<div className="filter-list">
					{PET_TYPES.map((pt) => (
						<CheckRow
							key={pt.value}
							checked={searchFilter.search.typeList?.includes(pt.value) ?? false}
							onChange={(v) => typeHandler(pt.value, v)}
							label={pt.label}
						/>
					))}
				</div>
			</div>

			{/* Category */}
			<div className="filter-section">
				<p className="filter-section__title">📦 Category</p>
				<div className="filter-list">
					{CATEGORIES.map((cat) => (
						<CheckRow
							key={cat.value}
							checked={searchFilter.search.categoryList?.includes(cat.value) ?? false}
							onChange={(v) => categoryHandler(cat.value, v)}
							label={cat.label}
						/>
					))}
				</div>
			</div>

			{/* Brand */}
			<div className="filter-section">
				<p className="filter-section__title">🏷️ Brand</p>
				<div className="filter-list">
					{visibleBrands.map((brand) => (
						<CheckRow
							key={brand}
							checked={searchFilter.search.brandList?.includes(brand) ?? false}
							onChange={(v) => brandHandler(brand, v)}
							label={brand}
						/>
					))}
				</div>
				{BRANDS.length > VISIBLE_BRANDS && (
					<button className="sf-show-more" onClick={() => setShowAllBrands((p) => !p)}>
						{showAllBrands ? '▲ Show less' : `▼ +${BRANDS.length - VISIBLE_BRANDS} more`}
					</button>
				)}
			</div>

			{/* Size */}
			<div className="filter-section">
				<p className="filter-section__title">📐 Size / Weight</p>
				<div className="sf-size-grid">
					{SIZES.map((s) => (
						<button
							key={s.value}
							className={`sf-size-chip${selectedSize === s.value ? ' sf-size-chip--active' : ''}`}
							onClick={() => sizeHandler(s.value, selectedSize !== s.value)}
						>
							{s.label}
						</button>
					))}
				</div>
			</div>

			{/* Price Range */}
			<div className="filter-section">
				<p className="filter-section__title">💰 Price Range</p>
				<div className="sf-price">
					<Slider
						value={priceRange}
						onChange={priceHandler}
						onChangeCommitted={priceCommitHandler}
						valueLabelDisplay="auto"
						min={0}
						max={500}
						sx={{ color: '#4E8A28' }}
					/>
					<div className="sf-price__labels">
						<span>${priceRange[0]}</span>
						<span>${priceRange[1]}</span>
					</div>
				</div>
			</div>

			{/* On Sale */}
			<div className="filter-section">
				<p className="filter-section__title">🔥 Deals</p>
				<CheckRow
					checked={searchFilter.search.onSale ?? false}
					onChange={(v) => saleHandler(v)}
					label="On sale only"
				/>
			</div>

		</div>
	);
};

export default ShopFilter;
