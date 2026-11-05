'use client';
// Hero sequence. Rest: the attio.com hero (centred headline, subline, two buttons) with a SaaS company's
// product suite open below it, every window already open and agent cursors at work. Scroll: the page moves
// the suite into view, then goes straight to the refund card: everything else steps back, the card lifts
// out of the agent chat and becomes the x-ray card (headroom.com's three-layer scan).
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronRight } from 'lucide-react';
import BookTrigger from './booking/BookTrigger';
import { prefersReducedMotion } from '@/engine/env';
import { useScrub } from '@/lib/useScrub';
import { offsetIn, placeAgents, startAgents } from './hero/agents';
import { Suite } from './hero/Suite';
import { StillCard, XraySubject } from './hero/XrayCard';
import s from './Hero.module.css';

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useScrub(
    ref,
    (tl, q, sec) => {
      const scene = q('[data-scene]')[0] as HTMLElement;
      const suite = q('[data-suite]')[0] as HTMLElement;
      const inner = suite.firstElementChild as HTMLElement;
      const subject = q('[data-subject]')[0] as HTMLElement;
      const card = inner.querySelector<HTMLElement>('[data-lift]')!;
      const stage = scene.parentElement as HTMLElement;
      const k = () => suite.offsetWidth / inner.offsetWidth;
      const nav = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;

      if (prefersReducedMotion()) {
        placeAgents(inner);
        return;
      }
      const agents = startAgents(inner);
      const st = { focus: 0 };
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? agents.resume() : agents.pause()));
      io.observe(sec);
      const tick = () => (st.focus > 0.05 ? agents.park() : agents.unpark());
      gsap.ticker.add(tick);

      // How far the scene scrolls so the main window sits centred under the nav.
      const shift = () => {
        const h = suite.offsetHeight;
        return suite.offsetTop - (nav() + Math.max(16, (stage.clientHeight - nav() - h) / 2));
      };
      // Where the refund card is on the stage once the scene has moved (design offsets × k).
      const from = () => {
        const kk = k();
        const o = offsetIn(card, inner);
        const x = suite.offsetLeft + o.x * kk;
        const y = suite.offsetTop - shift() + o.y * kk;
        const sc = (o.w * kk) / 300;
        return { x: x - subject.offsetLeft, y: y - subject.offsetTop, scale: sc, clip: subject.offsetHeight - (o.h * kk) / sc };
      };

      // Final card pose: never under the headline, and scaled down when the viewport is too short for both.
      const fit = () => {
        const copyEnd = Math.max(...q('[data-copy-a],[data-copy-b]').map((c) => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight));
        const top = Math.max(subject.offsetTop, copyEnd + (innerWidth < 768 ? 32 : 40)); // breathing room under the copy
        const sc = Math.min(1, (stage.clientHeight - top - 12) / subject.offsetHeight);
        return { x: (300 * (1 - sc)) / 2, y: top - subject.offsetTop, sc };
      };

      tl.fromTo(scene, { y: 0 }, { y: () => -shift(), duration: 0.14, ease: 'power1.inOut' }, 0)
        // Focus: Lyra settles on its refund card; everything else steps back.
        .to(st, { focus: 1, duration: 0.05 }, 0.15)
        .fromTo(inner.querySelector('[data-veil]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.15)
        .to(inner.querySelectorAll('[data-cursor-other]'), { autoAlpha: 0, duration: 0.04 }, 0.15)
        // Lift: the card leaves the chat and opens into the x-ray card.
        .to(inner.querySelectorAll('[data-cursor]'), { autoAlpha: 0, duration: 0.02 }, 0.24)
        .fromTo(subject, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.25)
        .fromTo(
          subject,
          { x: () => from().x, y: () => from().y, scale: () => from().scale, clipPath: () => `inset(0px 0px ${from().clip}px 0px round 8px)` },
          { x: () => fit().x, y: () => fit().y, scale: () => fit().sc, clipPath: 'inset(0px 0px 0px 0px round 8px)', duration: 0.1, ease: 'power2.inOut' },
          0.252,
        )
        .to(card, { autoAlpha: 0, duration: 0.02 }, 0.255)
        .to(suite, { autoAlpha: 0, scale: 0.97, filter: 'blur(6px)', duration: 0.07 }, 0.26)
        .fromTo(q('[data-cream]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.07 }, 0.26)
        // The x-ray flow (unchanged).
        .fromTo(q('[data-copy-a]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.36)
        .fromTo(q('[data-copy-a] h2'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.1 }, 0.36)
        .to(q('[data-copy-a]'), { autoAlpha: 0, y: -30, duration: 0.05 }, 0.5)
        .fromTo(q('[data-copy-b]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.53)
        .fromTo(q('[data-copy-b] h2'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.1 }, 0.53)
        // --scan is the band's top edge in % of the card: it starts just above the card and leaves at the bottom.
        .fromTo(subject, { '--scan': -47 }, { '--scan': 100, duration: 0.28, ease: 'none' }, 0.53)
        .fromTo(q('[data-edges]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.53)
        .to(q('[data-edges]'), { autoAlpha: 0, duration: 0.02 }, 0.8)
        .fromTo(q('[data-src]'), { opacity: 0.3 }, { opacity: 1, duration: 0.04, stagger: 0.008 }, 0.6)
        .fromTo(q('[data-val]'), { opacity: 0 }, { opacity: 1, duration: 0.03, stagger: 0.03 }, 0.66)
        .to(q('[data-checking]'), { autoAlpha: 0, duration: 0.02 }, 0.82)
        .fromTo(q('[data-sealed]'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.03 }, 0.83)
        .to({}, { duration: 0.12 });

      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        agents.kill();
      };
    },
    { reducedAt: 0 },
  );

  return (
    <section id="top" ref={ref} className={s.seq} aria-labelledby="hero-title">
      <div className={`stage ${s.stage}`}>
        <div className={`rules ${s.rules}`} aria-hidden="true" />

        {/* Copy and suite scroll together, like a normal page, until the suite is in view. */}
        <div className={s.scene} data-scene>
          <div className={s.intro}>
            {/* placeholder copy for the announcement pill */}
            <a href="#gateway" className={s.pill} data-reveal="fade" data-intro>
              Agent assurance, now in pilot
              <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
            <h1 id="hero-title" className={s.title} data-shimmer data-intro>
              Secure every action your agents take.
            </h1>
            <p className={s.sub} data-reveal="fade" data-intro data-delay="0.2">
              Auctervia checks each action against your policy before it runs, and keeps proof anyone can verify.
            </p>
            <div className={s.ctas} data-reveal="fade" data-intro data-delay="0.3">
              <a href="#gateway" className={s.outline}>
                See how it works
              </a>
              <BookTrigger className={`btn ${s.primary}`}>Book a pilot</BookTrigger>
            </div>
          </div>
          <div className={s.suite} data-suite >
            <Suite />
          </div>
        </div>

        <div className={s.cream} data-cream aria-hidden="true" />
        <XraySubject />

        <div className={s.copy} data-copy-a>
          <h2 className={s.h2} data-shimmer data-scroll-shimmer>Agents act. No one can prove they were allowed to.</h2>
          <p>Logs show what ran, never whether it was allowed.</p>
        </div>
        <div className={s.copy} data-copy-b>
          <h2 className={s.h2} data-shimmer data-scroll-shimmer>Now every action carries its proof.</h2>
          <p>Auctervia checks it against your policy before it runs, then seals the record.</p>
        </div>
      </div>

      {/* Reduced motion: the same story as a still, stacked layout. */}
      <div className={s.still}>
        <div>
          <h2 className={s.h2}>Agents act. No one can prove they were allowed to.</h2>
          <p>Logs show what ran, never whether it was allowed.</p>
          <StillCard />
        </div>
        <div>
          <h2 className={s.h2}>Now every action carries its proof.</h2>
          <p>Auctervia checks it against your policy before it runs, then seals the record.</p>
          <StillCard checked />
        </div>
      </div>
    </section>
  );
}
