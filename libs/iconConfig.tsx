import type { ReactNode } from 'react';
import PetsIcon from '@mui/icons-material/Pets';
import WaterIcon from '@mui/icons-material/Water';
import NatureIcon from '@mui/icons-material/Nature';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export const TYPE_CFG: Record<string, { icon: ReactNode; label: string; color: string }> = {
	DOG: { icon: <PetsIcon fontSize="small" />, label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: <PetsIcon fontSize="small" />, label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: <NatureIcon fontSize="small" />, label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: <WaterIcon fontSize="small" />, label: 'Fish', color: 'var(--teal)' },
};

export const CAT_CFG: Record<string, { icon: ReactNode; label: string }> = {
	FOOD: { icon: <RestaurantIcon fontSize="small" />, label: 'Food' },
	TOY: { icon: <SportsBasketballIcon fontSize="small" />, label: 'Toy' },
	MEDICINE: { icon: <MedicalServicesIcon fontSize="small" />, label: 'Medicine' },
	ACCESSORY: { icon: <ShoppingBagIcon fontSize="small" />, label: 'Accessory' },
};
