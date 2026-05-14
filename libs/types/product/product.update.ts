import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productCategory?: ProductCategory;
	productName?: string;
	productBrand?: string;
	productSize?: string;
	productPrice?: number;
	productStock?: number;
	productImages?: string[];
	productDesc?: string;
	productSale?: boolean;
	productSalePercent?: number;
	manufacturedAt?: Date;
}
