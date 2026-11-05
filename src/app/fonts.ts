import { Geist_Mono, Inter_Tight } from 'next/font/google';
import localFont from 'next/font/local';

export const switzer = localFont({
  src: [
    { path: '../fonts/switzer-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/switzer-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/switzer-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-switzer',
  display: 'swap',
});

export const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });

// Only used inside the hero's terminal window.
export const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });
