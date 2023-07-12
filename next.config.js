const defaultTheme = require('tailwindcss/defaultTheme')

const { screens } = defaultTheme

module.exports = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
					{
						key: 'Content-Security-Policy',
						value:
							"default-src 'self' https://www.youtube.com; script-src 'self' 'unsafe-inline' https://www.youtube.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://raw.githubusercontent.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; connect-src 'self' https://bao-dist-api.herokuapp.com https://bao-price-api.herokuapp.com https://cloudflare-eth.com https://api.etherscan.io https://*.infura.io https://*.alchemyapi.io https://hooks.zapier.com;",
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Access-Control-Allow-Origin',
						value: '*',
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,POST,OPTIONS',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: '*',
					},
					{
						key: 'Vary',
						value: 'Accept-Encoding',
					},
				],
			},
			{
				source: '/_next/static/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/(.*).ico',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/(.*).(png|jpg|webp|svg|gif)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/(.*).(eot|otf|ttf|ttc|woff|woff2|font|css)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		]
	},
	trailingSlash: true,
	poweredByHeader: false,
	reactStrictMode: true,
	swcMinify: false,
	productionBrowserSourceMaps: false,
	experimental: {
		newNextLinkBehavior: true,
		scrollRestoration: true,
		images: {
			allowFutureImage: true,
			unoptimized: true,
		},
	},
	images: {
		deviceSizes: [640, 768, 1024, 1280, 1536, 1600],
	},
	publicRuntimeConfig: {
		breakpoints: screens,
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: 'https://app.baofinance.io',
				permanent: false,
				basePath: false,
			},
			{
				source: '/vaults',
				destination: 'https://app.baofinance.io/vaults',
				permanent: false,
				basePath: false,
			},
			{
				source: '/baskets',
				destination: 'https://app.baofinance.io/baskets',
				permanent: false,
				basePath: false,
			},
			{
				source: '/ballast',
				destination: 'https://app.baofinance.io/ballast',
				permanent: false,
				basePath: false,
			},
			{
				source: '/gauges',
				destination: 'https://app.baofinance.io/gauges',
				permanent: false,
				basePath: false,
			},
			{
				source: '/vebao',
				destination: 'https://app.baofinance.io/vebao',
				permanent: false,
				basePath: false,
			},
		]
	},
}
