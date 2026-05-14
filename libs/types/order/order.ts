import { OrderItemStatus, OrderPaymentMethod, OrderStatus } from '../../enums/order.enum';

export interface OrderItem {
	_id: string;
	productId: string;
	itemQuantity: number;
	itemPrice: number;
	itemStatus: OrderItemStatus;
}

export interface Order {
	_id: string;
	memberId: string;
	orderItems: OrderItem[];
	orderTotal: number;
	orderStatus: OrderStatus;
	paymentMethod: OrderPaymentMethod;
	orderAddress: string;
	orderNote?: string;
	cancelReason?: string;
	cancelledAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}
