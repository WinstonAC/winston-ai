interface Theme {
  COLORS: {
    'brutalist-black': string;
    'brutalist-gray': string;
    'brutalist-accent': string;
  };
  FONTS: {
    mono: string;
    sans: string;
  };
  SPACING: {
    box: string;
  };
  FONT_SIZES: {
    heading: [string, { lineHeight: string }];
    mega: [string, { lineHeight: string }];
    shouty: [string, { lineHeight: string }];
  };
  BORDERS: {
    thicc: string;
  };
}

const theme: Theme = {
  COLORS: {
    'brutalist-black': '#0A0A0A',
    'brutalist-gray': '#F5F5F5',
    'brutalist-accent': '#32CD32',
  },
  
  FONTS: {
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    sans: 'var(--font-neue-haas), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  },
  
  SPACING: {
    box: '1.5rem',
  },
  
  FONT_SIZES: {
    heading: ['2.5rem', { lineHeight: '1.2' }],
    mega: ['4rem', { lineHeight: '1' }],
    shouty: ['6rem', { lineHeight: '1' }],
  },
  
  BORDERS: {
    thicc: '4px',
  },
};

export default theme; 