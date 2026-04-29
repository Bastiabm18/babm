/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors'); // <-- Importamos los colores de Tailwind

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
          light: colors.orange[500],  // orange-600
          light_alt: colors.neutral[700],  // orange-500
          dark: colors.green[800],   // orange-800
          dark_alt: colors.neutral[800], // orange-700 para un fondo alternativo en modo oscuro
        },
        background: {
        
          light: colors.orange[400], 
          light_alt: colors.orange[300], 
          dark: colors.neutral[900],
          dark_alt: colors.neutral[800], // Para un fondo alternativo en modo oscuro  
        },
        // Si necesitas texto puro, puedes usar el nativo neutral-white o neutral-950
        // o agregarlo aquí:
        text: {
          light: colors.neutral[900],
          dark: colors.neutral[50],
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