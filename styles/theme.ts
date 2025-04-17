export const theme = {
  colors: {
    gray: '#e5e5e5',
    black: '#171717',
    white: '#ffffff',
  },
  fonts: {
    mono: 'Menlo, Monaco, Courier New, monospace',
  },
  spacing: {
    section: '4rem',
    container: '2rem',
  },
} as const;

export type ThemeColor = keyof typeof theme.colors; 