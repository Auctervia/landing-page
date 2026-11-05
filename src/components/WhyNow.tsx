'use client';
// Why now, after attio.com (inverted to dark). The section sits under the hero (pulled up 100svh, lower
// z-index), so the hero scrolls away to uncover it. A statement fills in word by word from grey to white;
// then it scales down and moves to the top left to become the heading, the two stats appear below it, and
// a chart wipes in across the 1440px container: agent adoption curving up while governance stays flat.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useScrub } from '@/lib/useScrub';
import s from './WhyNow.module.css';

const statement = 'Agents can now refund, merge, deploy and edit records on their own. Almost no one can prove those actions were allowed.';
const stats = [
  { n: 40, text: 'of $1B+ companies are already scaling AI agents', src: 'McKinsey, 2026' },
  { n: 21, text: 'of enterprises report mature governance for agentic AI', src: 'Deloitte, 2026' },
];

const W = 1440;
const H = 600;
const adoption = `M0 ${H - 40} C ${W * 0.45} ${H - 50}, ${W * 0.72} ${H - 190}, ${W} 40`;
const governance = `M0 ${H - 40} C ${W * 0.5} ${H - 52}, ${W * 0.8} ${H - 92}, ${W} ${H - 128}`;
const area = `${adoption} L ${W} ${H} L 0 ${H} Z`;
// The statement's scale once it becomes the heading: big enough to read on phones and not tiny on desktop.
const shrink = () => (innerWidth < 768 ? 0.85 : 0.78);

export function WhyNow() {
  const ref = useRef<HTMLElement>(null);

  useScrub(
    ref,
    (tl, q) => {
      const nums = q('[data-num]') as HTMLElement[];
      const text = q('[data-statement]')[0] as HTMLElement;
      const box = q('[data-box]')[0] as HTMLElement;
      const statsEl = q('[data-stats]')[0] as HTMLElement;
      const counter = { a: 0, b: 0 };
      const paint = () => {
        nums[0].textContent = String(Math.round(counter.a));
        nums[1].textContent = String(Math.round(counter.b));
      };
      // Heading slot: the container's top-left corner. Layout offsets ignore transforms.
      const pad = () => Math.min(64, box.offsetWidth * 0.05);
      const slot = () => ({ x: box.offsetLeft + pad(), y: box.offsetTop + pad() });
      // GSAP owns both centering and travel; mixing CSS translate with its transform shifts the final slot.
      const move = () => ({ x: slot().x - text.offsetLeft, y: slot().y - text.offsetTop });
      gsap.set(text, { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 1, transformOrigin: '0 0' });
      const placeStats = () => {
        statsEl.style.left = `${slot().x}px`;
        statsEl.style.top = `${slot().y + text.offsetHeight * shrink() + 36}px`;
      };
      placeStats();
      addEventListener('resize', placeStats);
      // Staggered fromTo only pre-renders its first target, so set every stat's start state.
      gsap.set(q('[data-stat]'), { autoAlpha: 0, y: 20 });

      // Scroll triggers each word's colour sweep, without changing the centered layout.
      const words = q('[data-word]') as HTMLElement[];
      let lit = -1;
      tl.eventCallback('onUpdate', () => {
        const n = Math.round(gsap.utils.clamp(0, 1, (tl.progress() - 0.04) / 0.34) * words.length);
        if (n === lit) return;
        lit = n;
        words.forEach((w, i) => w.classList.toggle(s.on, i < n));
      });

      // The text is laid out left-aligned; each line starts shifted right so the block reads as centred.
      // Before it moves to the corner the shifts ease back to zero, so it left-aligns, then scales.
      const centreShift = () => {
        const shift: number[] = [];
        const lines = new Map<number, HTMLElement[]>();
        words.forEach((w) => lines.set(w.offsetTop, [...(lines.get(w.offsetTop) ?? []), w]));
        for (const line of lines.values()) {
          const first = line[0];
          const last = line[line.length - 1];
          const width = last.offsetLeft + last.offsetWidth - first.offsetLeft;
          const dx = (text.clientWidth - width) / 2 - first.offsetLeft;
          line.forEach(() => shift.push(dx));
        }
        return shift;
      };
      let shifts = centreShift();
      const shiftOf = (i: number) => {
        if (i === 0) shifts = centreShift();
        return shifts[i] ?? 0;
      };

      // The first third of the scroll is the hero sliding away to uncover this section.
      tl.fromTo(words, { x: shiftOf }, { x: 0, duration: 0.1, ease: 'power2.inOut' }, 0.62)
        .to(text, { x: () => move().x, y: () => move().y, xPercent: 0, yPercent: 0, scale: () => shrink(), duration: 0.1, ease: 'power2.inOut' }, 0.62)
        .fromTo(q('[data-reveal-rect]'), { attr: { width: 0 } }, { attr: { width: W }, duration: 0.24, ease: 'power1.inOut' }, 0.66)
        .fromTo(q('[data-chart-gradient]'), { attr: { x1: -320, x2: 0 } }, { attr: { x1: W - 320, x2: W }, duration: 0.24, ease: 'power1.inOut' }, 0.66)
        .fromTo(q('[data-chart-trail]'), { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.66)
        .to(q('[data-chart-trail]'), { opacity: 0, duration: 0.04 }, 0.88)
        .fromTo(q('[data-stat]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.05 }, 0.7)
        .fromTo(q('[data-stat] dt'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.18, stagger: 0.05 }, 0.7)
        .to(counter, { a: 40, b: 21, duration: 0.18, ease: 'power1.out', onUpdate: paint }, 0.72)
        .fromTo(q('[data-legend]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.88)
        .to({}, { duration: 0.06 });
      paint();
      return () => removeEventListener('resize', placeStats);
    },
    { reducedAt: 1 },
  );

  return (
    <section ref={ref} className={s.why} aria-labelledby="why-title">
      <div className={`stage ${s.stage}`}>
        <div className={s.box} data-box>
          <svg className={s.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="why-trail" gradientUnits="userSpaceOnUse" x1="-320" x2="0" y1="0" y2="0" data-chart-gradient>
                <stop offset="0" style={{ stopColor: 'var(--reveal-blue)' }} stopOpacity="0" />
                <stop offset="0.25" style={{ stopColor: 'var(--reveal-blue)' }} />
                <stop offset="0.6" style={{ stopColor: 'var(--reveal-coral)' }} />
                <stop offset="0.85" style={{ stopColor: 'var(--reveal-amber)' }} />
                <stop offset="1" style={{ stopColor: 'var(--reveal-amber)' }} stopOpacity="0" />
              </linearGradient>
              <pattern id="why-ticks" width="9" height={H} patternUnits="userSpaceOnUse">
                <line x1="0.5" y1="0" x2="0.5" y2={H} className={s.tick} />
              </pattern>
              <linearGradient id="why-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--sec-accent)' }} stopOpacity="0.2" />
                <stop offset="1" style={{ stopColor: 'var(--sec-accent)' }} stopOpacity="0" />
              </linearGradient>
              <clipPath id="why-area">
                <path d={area} />
              </clipPath>
              <clipPath id="why-reveal">
                <rect x="0" y="0" width="0" height={H} data-reveal-rect />
              </clipPath>
            </defs>
            {/* One left-to-right wipe reveals the shaded area and both lines together. */}
            <g clipPath="url(#why-reveal)">
              <g clipPath="url(#why-area)">
                <rect width={W} height={H} fill="url(#why-fade)" />
                <rect width={W} height={H} fill="url(#why-ticks)" />
              </g>
              <path d={governance} className={s.gov} />
              <path d={adoption} className={s.adopt} />
              <g data-chart-trail opacity="0">
                <path d={adoption} className={s.trail} />
                <path d={governance} className={s.trail} />
              </g>
            </g>
          </svg>
          <div className={s.legend} data-legend aria-hidden="true">
            <span className={s.legAdopt}>Agents in production</span>
            <span className={s.legGov}>Mature governance</span>
          </div>
        </div>

        <h2 id="why-title" className={s.statement} data-statement>
          {statement.split(' ').map((w, i) => (
            <span key={i}>
              <span className={s.word} data-word>
                {w}
              </span>{' '}
            </span>
          ))}
        </h2>

        <dl className={s.stats} data-stats>
          {stats.map((st) => (
            <div key={st.src} className={s.stat} data-stat>
              <dt data-shimmer data-scroll-shimmer>
                <span data-num>{st.n}</span>%
              </dt>
              <dd>
                {st.text}
                <span className={s.src}>{st.src}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
