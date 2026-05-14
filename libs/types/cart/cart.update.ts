export interface UpdateCartItemInput {
	cartId: string;
	productId: string;
	itemQuantity: number; // 0 = mahsulotni o'chirish
}

export interface RemoveCartItemInput {
	cartId: string;
	productId: string;
}
