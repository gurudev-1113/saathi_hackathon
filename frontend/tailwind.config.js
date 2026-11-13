/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbfb',
          100: '#d5f5f5',
          200: '#aee9e9',
          500: '#14b8a6', // teal-500
          600: '#0d9488', // teal-600
          700: '#0f766e', // teal-700
          900: '#134e4a',
        }
      }
    },
  },
  plugins: [],
}
