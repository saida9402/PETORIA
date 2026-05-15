import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Product } from '../../../types/product/product';
import { API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { ProductStatus } from '../../../enums/product.enum';

interface Data {
	id: string;
	name: string;
	price: string;
	brand: string;
	category: string;
	type: string;
	status: string;
}

const headCells = [
	{ id: 'id', label: 'MB ID', numeric: true },
	{ id: 'name', label: 'NAME', numeric: true },
	{ id: 'price', label: 'PRICE', numeric: false },
	{ id: 'brand', label: 'BRAND', numeric: false },
	{ id: 'category', label: 'CATEGORY', numeric: false },
	{ id: 'type', label: 'TYPE', numeric: false },
	{ id: 'status', label: 'STATUS', numeric: false },
];

function EnhancedTableHead() {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface ProductPanelListType {
	products: Product[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateProductHandler: any;
	removeProductHandler: any;
}

export const ProductPanelList = (props: ProductPanelListType) => {
	const {
		products,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateProductHandler,
		removeProductHandler,
	} = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					<EnhancedTableHead />
					<TableBody>
						{products.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={7}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{products.length !== 0 &&
							products.map((product: Product, index: number) => {
								const productImage = `${API_URL}/${product?.productImages[0]}`;

								return (
									<TableRow hover key={product?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{product._id}</TableCell>
										<TableCell align="left" className="name">
											{product.productStatus === ProductStatus.ACTIVE ? (
												<Stack direction={'row'}>
													<Link href={`/product/detail?id=${product?._id}`}>
														<div>
															<Avatar alt={product.productName} src={productImage} sx={{ ml: '2px', mr: '10px' }} />
														</div>
													</Link>
													<Link href={`/product/detail?id=${product?._id}`}>
														<div>{product.productName}</div>
													</Link>
												</Stack>
											) : (
												<Stack direction={'row'}>
													<div>
														<Avatar alt={product.productName} src={productImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
													<div style={{ marginTop: '10px' }}>{product.productName}</div>
												</Stack>
											)}
										</TableCell>

										<TableCell align="center">{product.productPrice}</TableCell>
										<TableCell align="center">{product.productBrand}</TableCell>
										<TableCell align="center">{product.productCategory}</TableCell>
										<TableCell align="center">{product.productType}</TableCell>
										<TableCell align="center">
											{product.productStatus === ProductStatus.DELETE && (
												<Button
													variant="outlined"
													sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
													onClick={() => removeProductHandler(product._id)}
												>
													<DeleteIcon fontSize="small" />
												</Button>
											)}

											{product.productStatus === ProductStatus.SOLD && (
												<Button className={'badge warning'}>{product.productStatus}</Button>
											)}

											{product.productStatus === ProductStatus.ACTIVE && (
												<>
													<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
														{product.productStatus}
													</Button>

													<Menu
														className={'menu-modal'}
														MenuListProps={{
															'aria-labelledby': 'fade-button',
														}}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(ProductStatus)
															.filter((ele) => ele !== product.productStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => updateProductHandler({ _id: product._id, productStatus: status })}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
