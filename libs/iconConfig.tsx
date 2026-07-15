import type { ReactNode } from 'react';
import PetsIcon from '@mui/icons-material/Pets';
import WaterIcon from '@mui/icons-material/Water';
import NatureIcon from '@mui/icons-material/Nature';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

// Icons inherit their size and color from the surrounding text (same convention
// as CategoryGrid's ICON_SX), so a single config renders correctly whether it
// sits in a large image placeholder, a small pill, or an inline detail row.
const ICON_SX = { fontSize: 'inherit', verticalAlign: 'middle' } as const;

export const TYPE_CFG: Record<string, { icon: ReactNode; label: string; color: string }> = {
	DOG: { icon: <PetsIcon sx={ICON_SX} />, label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: <PetsIcon sx={ICON_SX} />, label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: <NatureIcon sx={ICON_SX} />, label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: <WaterIcon sx={ICON_SX} />, label: 'Fish', color: 'var(--teal)' },
};

export const CAT_CFG: Record<string, { icon: ReactNode; label: string }> = {
	FOOD: { icon: <RestaurantIcon sx={ICON_SX} />, label: 'Food' },
	TOY: { icon: <SportsBasketballIcon sx={ICON_SX} />, label: 'Toy' },
	MEDICINE: { icon: <MedicalServicesIcon sx={ICON_SX} />, label: 'Medicine' },
	ACCESSORY: { icon: <ShoppingBagIcon sx={ICON_SX} />, label: 'Accessory' },
};
