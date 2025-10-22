/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
colors: {
  primary: {
    light: '#76ABAE', // Verde esmeralda suave para el modo claro
    dark: '#4DB6AC',  // Verde aguamarina claro para el modo oscuro
  },
  secondary: {
    light: '#A855F7', // Púrpura vibrante para el modo claro
    dark: '#D8B4FE',  // Púrpura más claro y suave para el modo oscuro
  },
  background: {
    light: '#F4F4F5', // Gris muy claro para el fondo en modo claro
    dark: '#1C2526',  // Gris oscuro elegante para el fondo en modo oscuro
  },
  text: {
    light: '#111827', // Gris oscuro para texto en modo claro
    dark: '#E5E7EB',  // Gris claro para texto en modo oscuro
  },
  accent: {
    light: '#F59E0B', // Amarillo ámbar como acento en modo claro
    dark: '#FBBF24',  // Amarillo más brillante para el modo oscuro
  }
    },
    fontFamily: {
      'alfa-slab-one': ['Alfa Slab One', 'serif'],
      'bangers': ['Bangers', 'cursive'],
      'caveat': ['Caveat', 'cursive'],
      'goldman': ['Goldman', 'sans-serif'],
    },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'),
  ],
}