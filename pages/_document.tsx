import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/petoriaLogoIcon.svg" />

				{/* SEO */}
				<meta name="keywords" content={'petoria, petoriashop, pet shop, pet products, dog, cat, bird, fish'} />
				<meta
					name={'description'}
					content={
						'Petoria — Your trusted pet shop. Find premium food, toys, medicine and accessories for dogs, cats, birds and fish. ' +
						'Shop the best pet products at the best prices on Petoria.'
					}
				/>
				{/* Open Graph defaults — per-page Head blocks override these for detail pages */}
				<meta property="og:site_name" content="Petoria" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Petoria — Your Pet's Happy Place" />
				<meta
					property="og:description"
					content="Shop premium pet food, toys, medicine and accessories for dogs, cats, birds and fish. Fast delivery, verified sellers."
				/>
				<meta name="twitter:card" content="summary_large_image" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
