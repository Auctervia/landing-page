'use client';
import { useRef } from 'react';
import { useScrub } from '@/lib/useScrub';
import { Box, CrateGradient, iso } from '@/lib/iso';
import s from './Pilot.module.css';

const stages = [
  { t: 'A four week pilot', d: 'One workflow, one policy. It ends in an evidence report and a release decision.' },
  { t: 'Assurance on every release', d: 'Each change re-tested, more workflows added, the evidence history kept for audits.' },
  { t: 'Independent assessment', d: 'Protocols and evidence tooling your assessors can use without us.' },
];
const plinths = [
  { y: 0, h: 24 },
  { y: -84, h: 62 },
  { y: -168, h: 100 },
];
const topOf = (k: number) => iso(30, plinths[k].y + 30, plinths[k].h);

export function Pilot() {
  const ref = useRef<HTMLElement>(null);

  useScrub(ref, (tl, q, el) => {
    const crate = q('[data-crate]')[0];
    const [x0, y0] = topOf(0);
    const hop = (k: number) => {
      const [x, y] = topOf(k);
      return { x: x - x0, y: y - y0 };
    };
    tl.eventCallback('onUpdate', () => {
      const p = tl.progress();
      el.dataset.step = String(p < 0.36 ? 0 : p < 0.7 ? 1 : 2);
    });
    tl.to(crate, { keyframes: [{ y: -50, duration: 0.06 }, { ...hop(1), duration: 0.1 }], ease: 'power2.inOut' }, 0.24)
      .to(crate, { keyframes: [{ y: hop(1).y - 50, duration: 0.06 }, { ...hop(2), duration: 0.1 }], ease: 'power2.inOut' }, 0.58)
      .to({}, { duration: 0.1 });
  });

  return (
    <section id="pilot" ref={ref} className={`section ruled ${s.pilot}`} aria-labelledby="pilot-title" data-step="0">
      <div className="stage">
        <div className={s.grid}>
          <div className={s.copy}>
            <h2 id="pilot-title" data-shimmer>
              Start with one workflow. Grow to every release.
            </h2>
            <ol className={s.stages}>
              {stages.map((st, i) => (
                <li key={st.t} className={s.stage} data-i={i}>
                  <h3>{st.t}</h3>
                  <p>{st.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <figure className={s.figure}>
            <svg viewBox="-70 -240 290 320" role="img" aria-label="Three plinths climbing: pilot, release assurance, independent assessment.">
              <CrateGradient id="pilot-crate" />
              {[2, 1, 0].map((k) => (
                <Box key={k} x={0} y={plinths[k].y} w={60} d={60} h={plinths[k].h} />
              ))}
              <Box x={19} y={19} z={24} w={22} d={22} h={18} data-crate className={s.crate} />
            </svg>
          </figure>
        </div>
      </div>
    </section>
  );
}
