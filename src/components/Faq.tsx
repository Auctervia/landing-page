// Six questions before the footer. Native <details>, so it works with the keyboard and without JS.
import { Plus } from 'lucide-react';
import { faqs } from '@/data/faq';
import s from './Faq.module.css';

export function Faq() {
  return (
    <section id="faq" className={`section ruled ${s.faq}`} aria-labelledby="faq-title">
      <div className={s.inner}>
        <h2 id="faq-title" data-shimmer>
          Questions, answered.
        </h2>
        <div className={s.list}>
          {faqs.map((f) => (
            <details key={f.q} className={s.item}>
              <summary>
                <span>{f.q}</span>
                <Plus size={18} strokeWidth={1.75} className={s.icon} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
