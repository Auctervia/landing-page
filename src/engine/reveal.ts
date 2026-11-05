// Declarative reveals (from the awwwards engine, trimmed to what this site uses):
//   data-split="lines"   masked line reveal (SplitText), on scroll or on intro
//   data-shimmer         beside.com heading reveal: faint, then a blue/coral/amber band sweeps it in
//   data-reveal="up|fade" block reveal
//   data-intro           play with the page intro instead of on scroll
//   data-delay="0.2"     extra delay (seconds)
// Skipped under reduced motion; hidden-before-reveal CSS is gated on html.motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ease, prefersReducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger, SplitText);

function splitTween(el: HTMLElement, isIntro: boolean) {
  const delay = parseFloat(el.dataset.delay || '0');
  const s = { tween: undefined as gsap.core.Tween | undefined, done: false, requested: false };
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    linesClass: 'split-line',
    onSplit(self) {
      gsap.set(el, { visibility: 'visible' });
      if (s.done) return;
      s.tween = gsap.from(self.lines, {
        yPercent: 110,
        rotate: 2,
        duration: 1.2,
        stagger: 0.08,
        ease: ease.out,
        delay,
        paused: isIntro && !s.requested,
        onComplete: () => { s.done = true; },
        scrollTrigger: isIntro ? undefined : { trigger: el, start: 'top 88%', once: true },
      });
      return s.tween;
    },
  });
  return () => { s.requested = true; s.tween?.play(); };
}

function blockTween(el: HTMLElement, paused: boolean) {
  const delay = parseFloat(el.dataset.delay || '0');
  const from: gsap.TweenVars = el.dataset.reveal === 'fade' ? { autoAlpha: 0 } : { y: 40, autoAlpha: 0 };
  gsap.set(el, { visibility: 'visible' });
  return gsap.fromTo(el, from, {
    y: 0,
    autoAlpha: 1,
    duration: paused ? 0.6 : 1.2,
    ease: ease.out,
    delay,
    paused,
    scrollTrigger: paused ? undefined : { trigger: el, start: 'top 90%', once: true },
  });
}

/** Wire every reveal on the page. Returns the intro timeline (paused). */
export function initReveals(root: ParentNode = document) {
  const intro = gsap.timeline({ paused: true });
  if (prefersReducedMotion()) return intro;
  // data-shimmer (after beside.com): the heading sits faint until it enters, then a multicolour band
  // sweeps through it as it fills in. The sweep itself is a CSS animation (globals.css, .shimmer-in).
  root.querySelectorAll<HTMLElement>('[data-shimmer]:not([data-scroll-shimmer])').forEach((el) => {
    const go = () => el.classList.add('shimmer-in');
    if (el.hasAttribute('data-intro')) intro.add(go, 0.05);
    else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: go });
  });
  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const isIntro = el.hasAttribute('data-intro');
    const play = splitTween(el, isIntro);
    if (isIntro) intro.add(play, 0);
  });
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const isIntro = el.hasAttribute('data-intro');
    const t = blockTween(el, isIntro);
    if (isIntro) intro.add(() => { t.play(); }, 0);
  });
  return intro;
}
