import React, { useState } from 'react';
import { Stack, Typography, Checkbox, Slider, Button, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCategory, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';

interface ShopFilterProps {
	initialInput: ProductsInquiry;
	searchFilter: ProductsInquiry;
	setSearchFilter: (input: ProductsInquiry) => void;
}

const PET_TYPES = [
	{ value: ProductType.DOG, label: '🐶 Dogs' },
	{ value: ProductType.CAT, label: '🐱 Cats' },
	{ value: ProductType.BIRD, label: '🐦 Birds' },
	{ value: ProductType.FISH, label: '🐠 Fish' },
];

const CATEGORIES = [
	{ value: ProductCategory.FOOD, label: '🍖 Food' },
	{ value: ProductCategory.MEDICINE, label: '💊 Medicine' },
	{ value: ProductCategory.ACCESSORY, label: '🎀 Accessories' },
	{ value: ProductCategory.TOY, label: '🎾 Toys' },
];

const BRANDS = [
	'Royal Canin',
	"Hill's",
	'Orijen',
	'Purina Pro',
	'Acana',
	'Pedigree',
	'Whiskas',
	'Kong',
	'Frontline',
	'Zymox',
];

const SIZES = [
	{ value: 'XS', label: 'XS — Extra Small' },
	{ value: 'S', label: 'S — Small' },
	{ value: 'M', label: 'M — Medium' },
	{ value: 'L', label: 'L — Large' },
	{ value: 'XL', label: 'XL — Extra Large' },
	{ value: '1KG', label: '1 kg' },
	{ value: '3KG', label: '3 kg' },
	{ value: '5KG', label: '5 kg' },
	{ value: '10KG', label: '10 kg' },
	{ value: '20KG', label: '20 kg' },
];

const VISIBLE_BRANDS = 5;

const ShopFilter = (props: ShopFilterProps) => {
	const { initialInput, searchFilter, setSearchFilter } = props;
	const device = useDeviceDetect();
	const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
	const [showAllBrands, setShowAllBrands] = useState(false);
	const [selectedSize, setSelectedSize] = useState<string>('');

	/** HANDLERS **/
	const typeHandler = (type: ProductType, checked: boolean) => {
		const current = searchFilter.search.typeList ?? [];
		const updated = checked ? [...current, type] : current.filter((t) => t !== type);
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, typeList: updated } });
	};

	const categoryHandler = (category: ProductCategory, checked: boolean) => {
		const current = searchFilter.search.categoryList ?? [];
		const updated = checked ? [...current, category] : current.filter((c) => c !== category);
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, categoryList: updated } });
	};

	const brandHandler = (brand: string, checked: boolean) => {
		const current = searchFilter.search.brandList ?? [];
		const updated = checked ? [...current, brand] : current.filter((b) => b !== brand);
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, brandList: updated } });
	};

	const sizeHandler = (size: string, checked: boolean) => {
		const newSize = checked ? size : '';
		setSelectedSize(newSize);
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: newSize || undefined },
		});
	};

	const priceHandler = (_: Event, newValue: number | number[]) => {
		setPriceRange(newValue as number[]);
	};

	const priceCommitHandler = (_: any, newValue: number | number[]) => {
		const [start, end] = newValue as number[];
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, pricesRange: { start, end } },
		});
	};

	const saleHandler = (checked: boolean) => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, onSale: checked || undefined },
		});
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
		<Stack className="shop-filter">

			{/* Pet Type */}
			<Stack className="filter-section">
				<Typography className="filter-title">🐾 Pet Type</Typography>
				<Stack className="filter-list">
					{PET_TYPES.map((pt) => (
						<Stack key={pt.value} direction="row" alignItems="center" className="filter-item">
							<Checkbox
								size="small"
								checked={searchFilter.search.typeList?.includes(pt.value) ?? false}
								onChange={(e) => typeHandler(pt.value, e.target.checked)}
								sx={{ color: '#4E8A28', '&.Mui-checked': { color: '#4E8A28' } }}
							/>
							<Typography>{pt.label}</Typography>
						</Stack>
					))}
				</Stack>
			</Stack>

			{/* Category */}
			<Stack className="filter-section">
				<Typography className="filter-title">📦 Category</Typography>
				<Stack className="filter-list">
					{CATEGORIES.map((cat) => (
						<Stack key={cat.value} direction="row" alignItems="center" className="filter-item">
							<Checkbox
								size="small"
								checked={searchFilter.search.categoryList?.includes(cat.value) ?? false}
								onChange={(e) => categoryHandler(cat.value, e.target.checked)}
								sx={{ color: '#4E8A28', '&.Mui-checked': { color: '#4E8A28' } }}
							/>
							<Typography>{cat.label}</Typography>
						</Stack>
					))}
				</Stack>
			</Stack>

			{/* Brand */}
			<Stack className="filter-section">
				<Typography className="filter-title">🏷 Brand</Typography>
				<Stack className="filter-list">
					{visibleBrands.map((brand) => (
						<Stack key={brand} direction="row" alignItems="center" className="filter-item">
							<Checkbox
								size="small"
								checked={searchFilter.search.brandList?.includes(brand) ?? false}
								onChange={(e) => brandHandler(brand, e.target.checked)}
								sx={{ color: '#4E8A28', '&.Mui-checked': { color: '#4E8A28' } }}
							/>
							<Typography>{brand}</Typography>
						</Stack>
					))}
				</Stack>
				{BRANDS.length > VISIBLE_BRANDS && (
					<Typography
						onClick={() => setShowAllBrands((prev) => !prev)}
						sx={{ color: '#4E8A28', cursor: 'pointer', fontSize: 12, mt: 0.5, pl: 1 }}
					>
						{showAllBrands ? '▲ Show less' : `▼ +${BRANDS.length - VISIBLE_BRANDS} more`}
					</Typography>
				)}
			</Stack>

			{/* Size / Weight */}
			<Stack className="filter-section">
				<Typography className="filter-title">📐 Size / Weight</Typography>
				<Stack className="filter-list">
					{SIZES.map((s) => (
						<Stack key={s.value} direction="row" alignItems="center" className="filter-item">
							<Checkbox
								size="small"
								checked={selectedSize === s.value}
								onChange={(e) => sizeHandler(s.value, e.target.checked)}
								sx={{ color: '#4E8A28', '&.Mui-checked': { color: '#4E8A28' } }}
							/>
							<Typography>{s.label}</Typography>
						</Stack>
					))}
				</Stack>
			</Stack>

			{/* Price Range */}
			<Stack className="filter-section">
				<Typography className="filter-title">💰 Price Range</Typography>
				{/* @ts-ignore */}
			<Box sx={{ px: 1 }}>
					<Slider
						value={priceRange}
						onChange={priceHandler}
						onChangeCommitted={priceCommitHandler}
						valueLabelDisplay="auto"
						min={0}
						max={500}
						sx={{ color: '#4E8A28' }}
					/>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="caption">${priceRange[0]}</Typography>
						<Typography variant="caption">${priceRange[1]}</Typography>
					</Stack>
				</Box>
			</Stack>

			{/* On Sale */}
			<Stack className="filter-section">
				<Typography className="filter-title">🔥 Deals</Typography>
				<Stack direction="row" alignItems="center" className="filter-item">
					<Checkbox
						size="small"
						checked={searchFilter.search.onSale ?? false}
						onChange={(e) => saleHandler(e.target.checked)}
						sx={{ color: '#4E8A28', '&.Mui-checked': { color: '#4E8A28' } }}
					/>
					<Typography>On Sale only</Typography>
				</Stack>
			</Stack>

			{/* Reset */}
			<Button
				onClick={resetHandler}
				variant="outlined"
				fullWidth
				sx={{ borderColor: '#4E8A28', color: '#4E8A28', mt: 1 }}
			>
				Reset Filters
			</Button>
		</Stack>
	);
};

export default ShopFilter;
