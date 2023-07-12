module.exports = {
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
