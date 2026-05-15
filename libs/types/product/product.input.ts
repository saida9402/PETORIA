import { Direction, ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';

export interface PricesRange {
	start: number;
	end: number;
}

export interface ProductInput {
	productType: ProductType;
	productCategory: ProductCategory;
	productName: string;
	productBrand: string;
	productSize?: string;
	productPrice: number;
	productStock: number;
	productImages: string[];
	productDesc?: string;
	productSale?: boolean;
	productSalePercent?: number;
	manufacturedAt?: Date;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		memberId?: string;
		typeList?: ProductType[];
		categoryList?: ProductCategory[];
		brandList?: string[];
		pricesRange?: PricesRange;
		onSale?: boolean;
		text?: string;
	};
}

export interface AgentProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		productStatus?: ProductStatus;
	};
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		productStatus?: ProductStatus;
		productType?: ProductType;
		typeList?: ProductType[];
		memberId?: string;
		text?: string;
	};
}
