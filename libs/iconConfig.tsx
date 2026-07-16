import type { ReactNode } from 'react';
import { Dog, Cat, Bird, Fish } from 'phosphor-react';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import DiamondIcon from '@mui/icons-material/Diamond';

// Single source of truth for pet-type / category iconography, mirroring the
// homepage "Shop by Category" set (CategoryGrid): pet types come from phosphor
// (Dog/Cat/Bird/Fish), categories from @mui/icons-material
// (Restaurant/LocalPharmacy/SportsEsports/Diamond). Every icon inherits its
// size from the surrounding font-size (phosphor `size="1em"` / MUI
// `fontSize:'inherit'`) and its color from `currentColor`, so a single config
// renders correctly in a large placeholder, a small pill or an inline detail
// row and adapts to dark/light automatically.
const PHOSPHOR_SX = { verticalAlign: 'middle' } as const;
const ICON_SX = { fontSize: 'inherit', verticalAlign: 'middle' } as const;

export const TYPE_CFG: Record<string, { icon: ReactNode; label: string; color: string }> = {
	DOG: { icon: <Dog size="1em" style={PHOSPHOR_SX} />, label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: <Cat size="1em" style={PHOSPHOR_SX} />, label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: <Bird size="1em" style={PHOSPHOR_SX} />, label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: <Fish size="1em" style={PHOSPHOR_SX} />, label: 'Fish', color: 'var(--teal)' },
};

export const CAT_CFG: Record<string, { icon: ReactNode; label: string }> = {
	FOOD: { icon: <RestaurantIcon sx={ICON_SX} />, label: 'Food' },
	TOY: { icon: <SportsEsportsIcon sx={ICON_SX} />, label: 'Toy' },
	MEDICINE: { icon: <LocalPharmacyIcon sx={ICON_SX} />, label: 'Medicine' },
	ACCESSORY: { icon: <DiamondIcon sx={ICON_SX} />, label: 'Accessory' },
};
