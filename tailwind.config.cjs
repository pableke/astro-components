/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: "class", // false, media or class
	theme: {
	  extend: {
		colors: { //https://www.tailwindshades.com/
		  "royal-blue": { DEFAULT: "#3563E9",  50: "#DBE3FB",  100: "#C8D5F9",  200: "#A3B8F5",  300: "#7F9CF1",  400: "#5A7FED",  500: "#3563E9",  600: "#1746CF",  700: "#11359D",  800: "#0C246A",  900: "#061338",  950: "#030A1E"},
		  "genoa": { DEFAULT: "#166064",  50: "#57D3DA",  100: "#47CFD6",  200: "#2CC0C8",  300: "#25A0A7",  400: "#1D8085",  500: "#166064",  600: "#0C3436",  700: "#020808",  800: "#000000",  900: "#000000"},
		  "mexican-red": { DEFAULT: "#9F2A2A",  50: "#F8EBE4",  100: "#F2D7CC",  200: "#E5AC9C",  300: "#D87B6C",  400: "#CB463B",  500: "#9F2A2A",  600: "#83232A",  700: "#661B26",  800: "#4A1420",  900: "#2E0C16"},
		  'mountain-meadow': {  DEFAULT: '#10B981',  50: '#FCFFFE',  100: '#E9FDF7',  200: '#C4FAE8',  300: '#9EF7D9',  400: '#79F3CB',  500: '#53F0BC',  600: '#2EEDAE',  700: '#13DF9B',  800: '#10B981',  900: '#0C855D',  950: '#096C4B'},
		  'celtic': {  DEFAULT: '#153725',  50: '#CFECDD',  100: '#C1E7D2',  200: '#A3DBBD',  300: '#86D0A8',  400: '#68C493',  500: '#4BB97E',  600: '#3D9E6A',  700: '#328157',  800: '#276343',  900: '#1B462F',  950: '#153725'}
		}
	  },
	},
	plugins: [],
}
