export const COLORS = {
  'brutalist-gray': '#e5e5e5',
  'brutalist-black': '#0a0a0a',
  'brutalist-lime': '#d4ff00',
  'purple-50': '#faf5ff',
  'purple-100': '#f3e8ff',
  'purple-500': '#a855f7',
  'purple-600': '#9333ea',
  'purple-700': '#7e22ce',
  'indigo-50': '#eef2ff',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-900': '#111827',
} as const;

export const FONTS = {
  mono: 'Courier New, monospace',
  sans: 'Inter, sans-serif',
} as const;

export const SPACING = {
  box: '2.5rem',
} as const;

export const FONT_SIZES = {
  heading: ['2.5rem', { lineHeight: '1.2' }],
  mega: ['4rem', { lineHeight: '1' }],
  shouty: ['6rem', { lineHeight: '0.9' }],
} as const;

export const BORDERS = {
  thicc: '4px',
} as const; 