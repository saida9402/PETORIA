export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topProductRank = 3;

export const TYPE_CFG: Record<string, { icon: string; label: string; color: string }> = {
	DOG: { icon: '🐶', label: 'Dog', color: 'var(--amber)' },
	CAT: { icon: '🐱', label: 'Cat', color: 'var(--purple)' },
	BIRD: { icon: '🐦', label: 'Bird', color: 'var(--blue)' },
	FISH: { icon: '🐟', label: 'Fish', color: 'var(--teal)' },
};

export const CAT_CFG: Record<string, { icon: string; label: string }> = {
	FOOD: { icon: '🍖', label: 'Food' },
	TOY: { icon: '🧸', label: 'Toy' },
	MEDICINE: { icon: '💊', label: 'Medicine' },
	ACCESSORY: { icon: '🦴', label: 'Accessory' },
};
