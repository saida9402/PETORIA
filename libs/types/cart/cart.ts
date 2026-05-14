import { CartStatus } from '../../enums/cart.enum';

export interface CartItem {
	_id: string;
	productId: string;
	productName: string;
	productImage?: string;
	itemPrice: number;
	itemQuantity: number;
}

export interface Cart {
	_id: string;
	memberId: string;
	cartItems: CartItem[];
	cartTotal: number;
	cartStatus: CartStatus;
	createdAt: Date;
	updatedAt: Date;
}
