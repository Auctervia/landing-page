'use client';
// Smooth scroll boots once from the layout. Reveals boot from <Reveals /> at the end of each page:
// with Cache Components the layout hydrates before the page segment, so splitting page text from here
// would mutate DOM React has not hydrated yet (hydration mismatch, then hidden headings).
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from '@/engine/scroll';
import { initReveals } from '@/engine/reveal';

export function Motion() {
  useEffect(() => {
    initScroll();
  }, []);
  return null;
}

/** Render as the LAST child of a page: its effect runs after every section on the page has hydrated. */
export function Reveals() {
  useEffect(() => {
    // A context so splits and tweens are reverted on unmount (and Strict Mode's double effect stays clean).
    const ctx = gsap.context(() => initReveals().play());
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);
  return null;
}
