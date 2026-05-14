import { OrderStatus } from '../../enums/order.enum';

export interface OrderUpdateInput {
	orderId: string;
	orderStatus: OrderStatus;
}

export interface OrderCancelInput {
	orderId: string;
	cancelReason?: string;
}
