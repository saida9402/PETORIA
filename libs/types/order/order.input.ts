import { OrderPaymentMethod } from '../../enums/order.enum';

export interface OrderItemInput {
	productId: string;
	itemQuantity: number;
	itemPrice: number;
}

export interface OrderInput {
	orderItems: OrderItemInput[];
	paymentMethod: OrderPaymentMethod;
	orderAddress: string;
	orderNote?: string;
}
