import BookTrigger from './booking/BookTrigger';
import { BrandLink } from './BrandLink';
import s from './Nav.module.css';

// Brand left, one primary action right.
export function Nav() {
  return (
    <header className={s.bar}>
      <nav className={s.inner} aria-label="Main">
        <BrandLink className={s.brand} />
        <div className={s.actions}>
          <BookTrigger className={`btn ${s.cta}`}>Book a pilot</BookTrigger>
        </div>
      </nav>
    </header>
  );
}
