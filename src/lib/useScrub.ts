'use client';
// A scrubbed timeline over a tall section whose stage is position: sticky (the headroom pattern).
// Under reduced motion there is no scrub: the timeline is parked at `reducedAt` (default: end state).
import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/engine/env';

gsap.registerPlugin(ScrollTrigger);

type Build = (tl: gsap.core.Timeline, q: (s: string) => Element[], el: HTMLElement) => void | (() => void);

export function useScrub(
  ref: RefObject<HTMLElement | null>,
  build: Build,
  opts: { start?: string; end?: string; reducedAt?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let off: void | (() => void);
    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion();
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        paused: reduce,
        scrollTrigger: reduce
          ? undefined
          : { trigger: el, start: opts.start ?? 'top top', end: opts.end ?? 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      });
      off = build(tl, gsap.utils.selector(el), el);
      if (reduce) tl.progress(opts.reducedAt ?? 1);
    }, el);
    return () => {
      off?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
