import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'grid', gap: 24, justifyItems: 'center' }}>
        <h1>4<span style={{ color: 'var(--muted)' }}>0</span>4</h1>
        <p className="lede">That page doesn’t exist, or it has moved.</p>
        <Link href="/" className="btn">
          Go home
        </Link>
      </div>
    </section>
  );
}
