/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,tsx,jsx,ts,js}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: { max: '640px' },
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: '#31363b',
        page: '#f5f5f5',
      },
      fontSize: {
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '3.5rem',
        '4xl': '7rem',
      },
    },
  },
  plugins: [],
};
