const { COLORS, FONTS, SPACING, FONT_SIZES, BORDERS } = require('./lib/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: COLORS,
        fontFamily: {
          mono: FONTS.mono.split(', '),
          sans: FONTS.sans.split(', '),
        },
        fontSize: {
          'heading': FONT_SIZES.heading,
          'mega': FONT_SIZES.mega,
          'shouty': FONT_SIZES.shouty,
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
      }
    },
    plugins: []
  }
  