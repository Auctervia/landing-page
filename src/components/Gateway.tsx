'use client';
import { useRef } from 'react';
import { useScrub } from '@/lib/useScrub';
import { alongX, Box, CrateGradient, iso, pts, ringPath, Stamp } from '@/lib/iso';
import s from './Gateway.module.css';

const steps = [
  { t: 'The agent requests an action', d: 'Issue a refund, merge code, edit a record.' },
  { t: 'It is held at the gate', d: 'Nothing reaches the tool until it is decided.' },
  { t: 'Allowed or denied', d: 'Checked against your own policy, not ours.' },
  { t: 'Stamped as evidence', d: 'What actually ran is captured and recorded.' },
];

// viewBox: x -95..275, y -45..210
const VB = { x: -95, y: -45, w: 370, h: 255 };
const at = (x: number, y: number, z: number) => {
  const [px, py] = iso(x, y, z);
  return { left: `${((px - VB.x) / VB.w) * 100}%`, top: `${((py - VB.y) / VB.h) * 100}%` };
};
const PIVOT = iso(167, -11, 40); // the arm starts at the collar's front face
const CRATE = 22;

export function Gateway() {
  const ref = useRef<HTMLElement>(null);

  useScrub(ref, (tl, q, el) => {
    const [b, a] = q('[data-crate]'); // b (the one that gets denied) is drawn first, behind a
    const [rx, ry] = iso(149, 45);
    const bars = q('[data-bar]');
    tl.eventCallback('onUpdate', () => {
      const p = tl.progress();
      el.dataset.step = String(p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.8 ? 2 : 3);
    });
    tl.to(a, { ...alongX(98), duration: 0.2, ease: 'power2.inOut' }, 0)
      .to(b, { ...alongX(94), duration: 0.2, ease: 'power2.inOut' }, 0.02)
      .to(bars[0], { scaleX: 1, duration: 0.2 }, 0)
      .fromTo(q('[data-ring]'), { autoAlpha: 0, scale: 0.6, svgOrigin: `${rx} ${ry}` }, { autoAlpha: 1, scale: 1, duration: 0.08 }, 0.22)
      .fromTo(q('[data-tag="hold"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.24)
      .to(bars[1], { scaleX: 1, duration: 0.2 }, 0.2)
      .to(q('[data-tag="hold"]'), { autoAlpha: 0, duration: 0.04 }, 0.4)
      .to(q('[data-ring]'), { autoAlpha: 0, duration: 0.04 }, 0.4)
      .to(q('[data-arm]'), { rotation: 80, svgOrigin: `${PIVOT[0]} ${PIVOT[1]}`, duration: 0.1, ease: 'power2.out' }, 0.4)
      .to(a, { ...alongX(196), duration: 0.14, ease: 'power2.inOut' }, 0.48)
      .fromTo(q('[data-tag="allow"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.6)
      .to(q('[data-arm]'), { rotation: 0, svgOrigin: `${PIVOT[0]} ${PIVOT[1]}`, duration: 0.08, ease: 'power2.in' }, 0.6)
      .to(b, { ...alongX(132), duration: 0.1, ease: 'power2.inOut' }, 0.66)
      .fromTo(q('[data-deny]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.76)
      .fromTo(q('[data-tag="deny"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.77)
      .to(bars[2], { scaleX: 1, duration: 0.4 }, 0.4)
      .fromTo(q('[data-stamp]'), { autoAlpha: 0, scale: 2.2, svgOrigin: `${iso(51, 45, 20).join(' ')}` }, { autoAlpha: 1, scale: 1, duration: 0.06, ease: 'power3.in' }, 0.82)
      .to(q('[data-tag="allow"]'), { autoAlpha: 0, duration: 0.03 }, 0.84)
      .fromTo(q('[data-tag="record"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.86)
      .to(bars[3], { scaleX: 1, duration: 0.18 }, 0.82);
  });

  return (
    <section id="gateway" ref={ref} className={`section ruled ${s.gateway}`} aria-labelledby="gate-title" data-step="0">
      <div className="stage">
        <div className={s.grid}>
          <div className={s.copy}>
            <h2 id="gate-title" data-shimmer>
              A checkpoint between any agent and its tools.
            </h2>
            <ol className={s.steps}>
              {steps.map((st, i) => (
                <li key={st.t} className={s.step} data-i={i}>
                  <span className={s.bar}>
                    <span data-bar />
                  </span>
                  <h3>{st.t}</h3>
                  <p>{st.d}</p>
                </li>
              ))}
            </ol>
          </div>

          <figure className={s.figure}>
            <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="img" aria-labelledby="gate-fig">
              <CrateGradient id="gateway-crate" />
              <title id="gate-fig">
                Actions queue at a barrier. One is allowed through and stamped as evidence; the next is denied and held.
              </title>
              <Box x={0} y={0} z={-8} w={300} d={90} h={8} />
              <line {...lineAt(4, 45, 296, 45)} className={s.dash} />
              <Box x={145} y={-51} w={44} d={40} h={5} />
              <Box x={150} y={-46} w={34} d={30} h={56} />
              <Box x={147} y={-49} z={56} w={38} d={34} h={4} />
              {/* front face: seam, window bezel, pivot collar for the arm */}
              <g className={s.detail}>
                <line {...onFront(150, 46, 184, 46)} />
                {/* side face: recessed panel with status lamps */}
                <polygon points={pts([iso(184, -42, 8), iso(184, -20, 8), iso(184, -20, 48), iso(184, -42, 48)])} />
              </g>
              {[40, 33, 26].map((z, i) => (
                <polygon key={z} points={pts([iso(184, -36, z), iso(184, -28, z), iso(184, -28, z + 4), iso(184, -36, z + 4)])} className={i === 0 ? s.lampOn : s.lamp} />
              ))}
              <Box x={153} y={-16} z={27} w={28} d={2} h={20} />
              <Box x={156} y={-14} z={30} w={22} d={1} h={14} className={s.window} />
              {/* etched into the plate: inset border */}
              <g className={s.plate}>
                <polygon points={pts([iso(157.5, -13, 31.5), iso(176.5, -13, 31.5), iso(176.5, -13, 42.5), iso(157.5, -13, 42.5)])} />
              </g>
              <Box x={162} y={-14} z={35} w={10} d={3} h={10} className={s.collar} />
              <path d={ringPath(149, 45, 0, 26)} className={s.ring} data-ring />

              <g data-crate className={s.crate}>
                <Box x={6} y={34} w={CRATE} d={CRATE} h={20} />
                <Box x={6} y={34} w={CRATE} d={CRATE} h={20} className={s.deny} data-deny />
              </g>
              <g data-crate className={s.crate}>
                <Box x={40} y={34} w={CRATE} d={CRATE} h={20} />
                <Stamp x={40} y={34} z={20} size={CRATE} className={s.stamp} data-stamp />
              </g>

              <Box x={165} y={-11} z={38} w={4} d={107} h={4} data-arm className={s.arm}>
                {/* hazard stripes along the outer end, on the top and the visible side */}
                {[54, 68, 82].map((y) => (
                  <g key={y} className={s.stripe}>
                    <polygon points={pts([iso(169, y, 38), iso(169, y + 7, 38), iso(169, y + 7, 42), iso(169, y, 42)])} />
                    <polygon points={pts([iso(165, y, 42), iso(169, y, 42), iso(169, y + 7, 42), iso(165, y + 7, 42)])} />
                  </g>
                ))}
              </Box>
            </svg>

            <span className={`chip ${s.tag}`} data-tag="hold" style={at(149, 45, 44)}>
              <span className="dot" /> Held · checking policy v12
            </span>
            <span className={`chip chip--allow ${s.tag}`} data-tag="allow" style={at(247, 45, 44)}>
              Allowed
            </span>
            <span className={`chip chip--violet ${s.tag}`} data-tag="record" style={at(247, 45, 44)}>
              Record #0412 · linked to #0411
            </span>
            <span className={`chip chip--deny ${s.tag}`} data-tag="deny" style={at(149, 45, 44)}>
              Denied · no matching approval
            </span>
          </figure>
        </div>
      </div>
    </section>
  );
}

// A line on the post's front face (the y = -16 plane), given x and z extents.
function onFront(x1: number, z1: number, x2: number, z2: number) {
  const [ax, ay] = iso(x1, -16, z1);
  const [bx, by] = iso(x2, -16, z2);
  return { x1: ax, y1: ay, x2: bx, y2: by };
}

function lineAt(x1: number, y1: number, x2: number, y2: number) {
  const [ax, ay] = iso(x1, y1);
  const [bx, by] = iso(x2, y2);
  return { x1: ax, y1: ay, x2: bx, y2: by };
}
