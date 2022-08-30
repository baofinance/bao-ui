const defaultTheme = require('tailwindcss/defaultTheme')

const { screens } = defaultTheme

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

// @ts-check
/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
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
}

module.exports = withBundleAnalyzer(nextConfig)
