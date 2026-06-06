import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/petoriaLogoIcon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'petoria, petoriashop, pet shop, pet products, dog, cat, bird, fish'} />
				<meta
					name={'description'}
					content={
						'Petoria — Your trusted pet shop. Find premium food, toys, medicine and accessories for dogs, cats, birds and fish. ' +
						'Shop the best pet products at the best prices on Petoria.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
