'use client';
// Footer after amini.ai: dark, logo and line on the left, a book-a-pilot action on the right, four link columns,
// a bottom bar, and the wordmark set huge and fading out below it.
import { ArrowRight } from 'lucide-react';
import { site } from '@/data/site';
import { useBooking } from './booking/BookingProvider';
import { BrandLink } from './BrandLink';
import { ThemeSelector } from './ThemeToggle';
import s from './Footer.module.css';

// placeholder: true — social and resource URLs are stand-ins until the real ones exist.
const columns = [
  { title: 'Product', links: [['How it works', '#gateway'], ['Platform', '#platform'], ['Pilot', '#pilot'], ['FAQ', '#faq']] },
  { title: 'Company', links: [['Contact', `mailto:${site.email}`], ['Book a pilot', 'book']] },
  { title: 'Resources', links: [['Evidence format', '#'], ['Security', '#']] },
  { title: 'Socials', links: [['LinkedIn', '#'], ['X (Twitter)', '#']] },
  { title: 'Legal', links: [['Terms of service', '#'], ['Privacy policy', '#']] },
];

export function Footer() {
  const { open } = useBooking();
  return (
    <footer className={`ruled ${s.footer}`}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.brandCol}>
            <BrandLink className={s.brand} size={26} />
            <p className={s.line}>The evidence layer for AI agents that take real actions.</p>
          </div>
          <div className={s.book}>
            <p className={s.bookLabel}>Ready to put your agents behind the gateway?</p>
            <button type="button" className={s.bookBtn} onClick={() => open()}>
              Book a pilot <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav className={s.cols} aria-label="Footer" hidden>
          {columns.map((c) => (
            <div key={c.title}>
              <p className={s.colTitle}>{c.title}</p>
              <ul>
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href === 'book' ? (
                      <button type="button" onClick={() => open()}>
                        {label}
                      </button>
                    ) : (
                      <a href={href}>{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={s.bar}>
          <span>© 2026 Auctervia</span>
          <ThemeSelector />
        </div>
      </div>
      <p className={s.wordmark} aria-hidden="true">
        Auctervia
      </p>
    </footer>
  );
}
