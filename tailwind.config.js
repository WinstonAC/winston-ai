const { COLORS, FONTS, SPACING, FONT_SIZES, BORDERS } = require('./lib/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          base: ['Figtree', 'Helvetica', 'Arial', 'sans-serif'],
          heading: ['Work Sans', 'Helvetica', 'Arial', 'sans-serif'],
        },
        colors: {
          background: '#171C28',
          input: '#1C2333',
          divider: '#2B3548',
          primary: {
            DEFAULT: '#2B63F3',
            hover: '#1E4CD8',
          },
        },
        fontSize: {
          '13': '13px',
          '15': '15px',
          '32': '32px',
        },
        borderWidth: {
          'thicc': BORDERS.thicc,
        },
        spacing: {
          'box': SPACING.box,
        },
        borderRadius: {
          'none': '0',
        },
        maxWidth: {
          '8xl': '88rem',
        },
        keyframes: {
          'float-slow': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(20px, -20px)' },
          },
          'float-medium': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-15px, 15px)' },
          },
          'float-fast': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(10px, 10px)' },
          },
        },
        animation: {
          'float-slow': 'float-slow 8s ease-in-out infinite',
          'float-medium': 'float-medium 6s ease-in-out infinite',
          'float-fast': 'float-fast 4s ease-in-out infinite',
        },
      }
    },
    plugins: []
  }
  