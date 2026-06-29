/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: '#c9a84c', light: '#e8c76e', dark: '#9e7a2e' },
        navy:  { DEFAULT: '#06101a', 800: '#0d1f2d', 700: '#122535' }
      },
      fontFamily: {
        sans:  ['"Inter"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif']
      }
    }
  },
  plugins: []
};
