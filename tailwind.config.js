/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FEE440', // banana yellow
        'primary-hover': '#FDD000', // darker banana yellow
        dark: '#1E1E1E',    // dark gray text
        light: '#FCFCFC',   // almost white background
        accent: '#C084FC',  // soft lilac
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '2px 2px 0px 0px #1E1E1E',
        'neo-hover': '3px 3px 0px 0px #1E1E1E',
      },
    },
  },
  plugins: [],
} 