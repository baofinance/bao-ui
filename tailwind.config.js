/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		fontFamily: {
			bakbak: ['Bakbak One', 'sans-serif'],
			inter: ['Inter', 'sans-serif'],
		},
		accordion: {
			styles: {
				base: {
					header: {
						icon: 'hidden',
					},
				},
			},
		},
		extend: {
			backgroundImage: () => ({
				baoBackground: "url('/images/bao-background.png')",
			}),
			colors: {
				current: 'currentColor',
				white: '#ffffff',
				black: '#000000',
				red: '#dc3545',
				green: '#28a745',
				blue: '#007bff',
				baoWhite: '#faf2e3',
				baoBlack: '#1e2022',
				baoRed: '#e21a53',
				transparent: {
					100: '#1e202280', //black
					200: '#faf2e380', //white
					300: '#e21a5380', //red
				},
			},
			fontSize: {
				hero: [
					'48px',
					{
						letterSpacing: '0.05em;',
						lineHeight: '96px',
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
				rainbowLight: {
					'0%': {
						backgroundPosition: '0% 50%',
					},
					'50%': {
						backgroundPosition: '100% 50%',
					},
					'100%': {
						backgroundPosition: '0% 50%',
					},
				},
			},
			animation: {
				'slide-in': 'slideIn 0.3s forwards ease-out',
				'rainbow-light': 'rainbowLight 2s linear infinite',
			},
			screens: {
				'3xl': '1600px',
			},
		},
		plugins: [require('@tailwindcss/forms')],
		corePlugins: {},
	},
}
