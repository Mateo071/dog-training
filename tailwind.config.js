/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          blue: '#2563eb',
          'blue-light': '#3b82f6',
          'blue-dark': '#1d4ed8',
          teal: '#0d9488',
          'teal-light': '#14b8a6',
          'teal-dark': '#0f766e',
        }
      }
    },
  },
  plugins: [],
}