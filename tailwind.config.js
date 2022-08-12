const { default: Script } = require('next/script');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		backgroundImage: () => ({
			darkOverlay: "url('/images/background_overlay_dark.png')",
			lightOverlay: "url('/images/background_overlay_light.png')",
		}),
		backgroundGradient: {
			darkGradient: 'radial-gradient(circle at center, #391818, #210e0e 50%) fixed',
			lightGradient: 'radial-gradient(circle at center, #efeae7, #fff8ee 50%) fixed',
		},
		colors: {
			current: 'currentColor',
			'white': '#ffffff',
			'black': '#000000',
			'red': '#d00000',
			'green': '#008000',
			'blue': '#0000f0',
			'primary': {
				100: '#391818',
				200: '#481e1e',
				300: '#562424',
				400: '#622a2a',
				500: '#622a2a',
			},
			'secondary': {
				100: '#efeae7',
				200: '#e7dfda',
				300: '#ded4ce',
				400: '#d6c9c2',
				500: '#cebfb6',
			},
			'accent': {
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
			'monochrome': {
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
			'text': {
				100: '#fff8ee', //primary
				200: '#aa9585', //secondary
				300: '#CC9902', //hover link
				400: '#FFD84B', //active link
			},
			'background': {
				100: '#fff8ee', //dark mode
				200: '#50251c', //light mode
			},
			transparent: {
				100: 'rgba(0, 0, 0, 0.1)', //dark
				200: 'rgba(256, 256, 256, 0.1)', //light
			},
		},
		borderRadius: '8px',
		fontSize: {
			xs: '.75rem',
			sm: '.875rem',
			default: '1rem',
			md: '1.15rem',
			large: '1.25rem',
			xl: '1.5rem',
			xxl: '2rem',
			xxxl: '4rem',
		},
		fontWeight: {
			thin: 100,
			regular: 300,
			medium: 500,
			strong: 700,
		},
    boxShadow: {
      default: '0px 4px 28px rgba(0, 0, 0, 0.15)',
      invert: '0px 4px 28px rgba(0, 0, 0, 0.15)',
    },
    border: {
      light: '1px solid #562424',
      dark: '1px solid #ded4ce',
    },
    topBarSize: 72,
    fontFamily: {
      rubik: ['Rubik', 'sans-serif'],
      poppins: ['Poppins', 'sans-serif'],
      kaushan: ['Kaushan Script', 'sans-serif'],
    },
		extend: {},
	},
	plugins: [],
}
