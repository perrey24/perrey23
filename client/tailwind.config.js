/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B192C',
          800: '#1E3E62',
          700: '#2A4E7A',
          600: '#386399',
          100: '#E8F1FC',
          50: '#F4F8FD'
        },
        gold: {
          500: '#D4AF37',
          600: '#B89726',
          100: '#FBF5DC'
        }
      }
    },
  },
  plugins: [],
}
