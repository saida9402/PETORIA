// /** @type {import('next').NextConfig} */
// const nextConfig = {
// 	reactStrictMode: true,
// 	output: 'standalone',
// 	async headers() {
// 		return [
// 			{
// 				source: '/(.*)',
// 				headers: [
// 					{ key: 'X-Frame-Options', value: 'DENY' },
// 					{ key: 'X-Content-Type-Options', value: 'nosniff' },
// 					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
// 				],
// 			},
// 		];
// 	},
// 	async redirects() {
// 		return [
// 			// Canonical shop route — old product path redirects here
// 			{ source: '/product', destination: '/shop', permanent: true },
// 			// Community aliases
// 			{ source: '/board', destination: '/community', permanent: false },
// 			{ source: '/board/:path*', destination: '/community/:path*', permanent: false },
// 			// Missing pages → closest existing equivalent
// 			{ source: '/events', destination: '/cs', permanent: false },
// 			{ source: '/events/:id', destination: '/cs', permanent: false },
// 			{ source: '/seller', destination: '/seller/detail', permanent: false },
// 		];
// 	},
// };

// const { i18n } = require('./next-i18next.config');
// nextConfig.i18n = i18n;

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,

  i18n,

  output: 'standalone',

   eslint: {
    ignoreDuringBuilds: true
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ];
  },

  async redirects() {
    return [
      {
        source: '/product',
        destination: '/shop',
        permanent: true
      },

      {
        source: '/board',
        destination: '/community',
        permanent: false
      },
      {
        source: '/board/:path*',
        destination: '/community/:path*',
        permanent: false
      },

      {
        source: '/events',
        destination: '/cs',
        permanent: false
      },
      {
        source: '/events/:id',
        destination: '/cs',
        permanent: false
      }

      // ⚠️ seller redirectni ehtiyot qiling:
      // agar /seller page SSR bo'lsa, bu conflict beradi
      // {
      //   source: '/seller',
      //   destination: '/seller/detail',
      //   permanent: false
      // }
    ];
  }
};

module.exports = nextConfig;