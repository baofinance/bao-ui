const { default: Script } = require('next/script')

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		fontFamily: {
			poppins: ['Poppins', 'sans-serif'],
			kaushan: ['Kaushan Script', 'sans-serif'],
		},
		accordion: {
			styles: {
			  base: {
				header: {
				  icon: "hidden",
				},
			  },
			},
		  },
		extend: {
			backgroundImage: () => ({
				darkOverlay: "url('/images/background_overlay_dark.png'), radial-gradient(circle at center, #391818, #210e0e 50%) fixed",
				lightOverlay: "url('/images/background_overlay_light.png'), radial-gradient(circle at center, #efeae7, #fff8ee 50%) fixed",
			}),
			colors: {
				current: 'currentColor',
				white: '#ffffff',
				black: '#000000',
				red: '#d00000',
				green: '#008000',
				blue: '#0000f0',
				primary: {
					100: '#391818',
					200: '#481e1e',
					300: '#562424',
					400: '#622a2a',
					500: '#622a2a',
				},
				secondary: {
					100: '#efeae7',
					200: '#e7dfda',
					300: '#ded4ce',
					400: '#d6c9c2',
					500: '#cebfb6',
				},
				accent: {
					100: '#fde9d8',
					200: '#fcd4b1',
					300: '#fabe89',
					400: '#f8a862',
					500: '#f7933b',
					600: '#f57d14',
					700: '#ce6509',
					800: '#b05607',
					900: '#894306',
				},
				monochrome: {
					100: '#e5e5e5',
					200: '#cccccc',
					300: '#b2b2b2',
					400: '#999999',
					500: '#7f7f7f',
					600: '#666666',
					700: '#4c4c4c',
					800: '#323232',
					900: '#191919',
				},
				text: {
					100: '#fff8ee', //primary
					200: '#aa9585', //secondary
					300: '#CC9902', //hover link
					400: '#FFD84B', //active link
				},
				background: {
					100: '#210e0e', //dark mode
					200: '#fff8ee', //dark mode
				},
				transparent: {
					100: 'rgba(0, 0, 0, 0.1)', //dark
					200: 'rgba(256, 256, 256, 0.1)', //light
				},
			},
			fontSize: {
				hero: [
					'48px',
					{
						letterSpacing: '-0.02em;',
						lineHeight: '96px',
						fontWeight: 700,
					},
				],
			},
			keyframes: {
				slideIn: {
					'0%': {
						transform: 'translateX(0)',
					},
					'100%': {
						transform: 'translateX(-100%)',
					},
				},
			},
			animation: {
				'slide-in': 'slideIn 0.3s forwards ease-out',
			},
			screens: {
				'3xl': '1600px',
			},
		},
		plugins: [],
		corePlugins: {},
	},
}
