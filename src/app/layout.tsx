import type { Metadata, Viewport } from 'next';
import { Motion } from '@/components/Motion';
import { Nav } from '@/components/Nav';
import { ThemeToggle } from '@/components/ThemeToggle';
import BookingProvider from '@/components/booking/BookingProvider';
import { site } from '@/data/site';
import { geistMono, interTight, switzer } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: './' },
  openGraph: { type: 'website', siteName: site.name, title: site.title, description: site.description },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0f' },
  ],
};

// Runs before first paint: hidden-until-revealed styles only apply when JS and motion are on.
const flags = `var mode='system';try{var saved=localStorage.getItem('theme');if(saved==='light'||saved==='dark')mode=saved}catch(e){}document.documentElement.dataset.colorMode=mode;document.documentElement.dataset.theme=mode==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    email: site.email,
    description: site.description,
    logo: `${site.url}/icon.svg`,
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url },
];

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${switzer.variable} ${interTight.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: flags }} />
      </head>
      <body>
        <BookingProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <Motion />
        <ThemeToggle />
        </BookingProvider>
      </body>
    </html>
  );
}
