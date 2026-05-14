import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../member/member';

export interface Product {
	_id: string;
	productType: ProductType;
	productStatus: ProductStatus;
	productCategory: ProductCategory;
	productName: string;
	productBrand: string;
	productSize?: string;
	productPrice: number;
	productStock: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	productImages: string[];
	productDesc?: string;
	productSale: boolean;
	productSalePercent?: number;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	manufacturedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
