import localFont from 'next/font/local'

export const neueHaasGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/NeueHaasGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasGrotesk-Bold.woff2',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-neue-haas'
}); 