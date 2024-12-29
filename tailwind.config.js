/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#202123',
          25: '#111111',
          50: '#212121e6',
          100: '#424242',
          200: '#212121e6',
          300: '#212121e6',
          400: '#9c9c9c', // Lighter
          500: '#D1D1DE', // Lighter
          600: '#ECECF1', // Lighter
          700: '#F7F7F8', // Lighter

        }
      }
    },
  },
  plugins: [],
};