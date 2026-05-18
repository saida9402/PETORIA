'use client';
import Link from 'next/link';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { ProductStatus, ProductType, ProductCategory } from '../../enums/product.enum';

const ITEMS: Product[] = [
	{
		_id: 'n1',
		productName: 'Acana Grasslands Cat',
		productBrand: 'Acana',
		productPrice: 58,
		productImages: [],
		productLikes: 23,
		productViews: 145,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.CAT,
		productCategory: ProductCategory.FOOD,
		productStock: 10,
		productRank: 0,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		_id: 'n2',
		productName: 'Purina Pro Senior Dog',
		productBrand: 'Purina',
		productPrice: 45,
		productImages: [],
		productLikes: 18,
		productViews: 98,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.DOG,
		productCategory: ProductCategory.FOOD,
		productStock: 8,
		productRank: 0,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		_id: 'n3',
		productName: 'Kong Wobbler Treat',
		productBrand: 'Kong',
		productPrice: 19,
		productImages: [],
		productLikes: 31,
		productViews: 201,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.DOG,
		productCategory: ProductCategory.TOY,
		productStock: 15,
		productRank: 5,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		_id: 'n4',
		productName: 'Furminator Long Hair',
		productBrand: 'Furminator',
		productPrice: 35,
		productImages: [],
		productLikes: 12,
		productViews: 87,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.CAT,
		productCategory: ProductCategory.ACCESSORY,
		productStock: 5,
		productRank: 0,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		_id: 'n5',
		productName: 'Pedigree Dentastix',
		productBrand: 'Pedigree',
		productPrice: 14,
		productImages: [],
		productLikes: 28,
		productViews: 167,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.DOG,
		productCategory: ProductCategory.MEDICINE,
		productStock: 20,
		productRank: 0,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		_id: 'n6',
		productName: 'Zymox Pet Spray',
		productBrand: 'Zymox',
		productPrice: 22,
		productImages: [],
		productLikes: 9,
		productViews: 54,
		productStatus: ProductStatus.ACTIVE,
		productType: ProductType.DOG,
		productCategory: ProductCategory.MEDICINE,
		productStock: 12,
		productRank: 0,
		productComments: 0,
		productSale: false,
		memberId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

export default function NewArrivals() {
	return (
		<section
			className="new-arrivals"
			style={{
				background: 'var(--card)',
				borderTop: '1px solid var(--border2)',
				borderBottom: '1px solid var(--border2)',
			}}
		>
			<div className="wrap">
				<div className="section-hd">
					<div>
						<p className="section-hd__eyebrow">Just arrived</p>
						<h2 className="section-hd__title">New Arrivals</h2>
					</div>
					<Link href="/shop?sort=newest" className="section-hd__link">
						See all new →
					</Link>
				</div>
				<div className="new-arrivals__carousel">
					{ITEMS.map((p) => (
						<div key={p._id} className="new-arrivals__item">
							<ProductCard product={p} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
