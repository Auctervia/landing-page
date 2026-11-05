// Agent cursors working across the suite. Each agent is a looping GSAP timeline (the one clock) that
// moves its cursor to real elements ([data-target]), clicks them and types into [data-type] fields.
// park()/unpark() hand control to the scroll: every loop pauses and Lyra (support) settles on
// "Issue refund", which marks the refund card as pending.
import { gsap } from 'gsap';

type Step =
  | { go: string; d?: number }
  | { click: string }
  | { type: string; text: string }
  | { wait: number }
  | { call: () => void };

/** Position of an element in the suite's own (unscaled) coordinates. */
export function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

export function startAgents(root: HTMLElement) {
  const $ = (sel: string) => root.querySelector<HTMLElement>(sel);
  const tgt = (name: string) => $(`[data-target="${name}"]`);
  const field = (name: string) => $(`[data-type="${name}"]`);
  const cursor = (id: string) => $(`[data-cursor="${id}"]`)!;
  const card = $('[data-lift]');
  const visible = (el: HTMLElement | null) => !!el && el.offsetParent !== null;

  const point = (name: string) => {
    const el = tgt(name);
    if (!el) return { x: 0, y: 0 };
    const o = offsetIn(el, root);
    return { x: o.x + Math.min(o.w * 0.5, 60), y: o.y + o.h * 0.55 };
  };

  // Move along a gentle arc (bowed sideways by a fraction of the distance), not a straight line.
  const arc = (tl: gsap.core.Timeline, c: HTMLElement, a: { x: number; y: number }, b: { x: number; y: number }, d: number, bow: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const m = { x: (a.x + b.x) / 2 - dy * bow, y: (a.y + b.y) / 2 + dx * bow };
    tl.to(c, { keyframes: { x: [m.x, b.x], y: [m.y, b.y], easeEach: 'sine.inOut' }, duration: d, ease: 'power1.inOut' });
  };

  const build = (id: string, steps: Step[], delay: number, reset: () => void, bow: number) => {
    const c = cursor(id);
    // Each cursor starts on its own first target and its loop ends back there, so the repeat never jumps.
    const first = steps.find((x) => 'go' in x) as { go: string } | undefined;
    const start = first ? point(first.go) : { x: 0, y: 0 };
    gsap.set(c, start);
    const tl = gsap.timeline({ repeat: -1, delay, onRepeat: reset });
    reset();
    let at = start;
    for (const s of steps) {
      if ('go' in s) {
        const p = point(s.go);
        if (p.x !== at.x || p.y !== at.y) arc(tl, c, at, p, s.d ?? 1.1, bow);
        at = p;
      } else if ('click' in s) {
        const el = tgt(s.click);
        tl.to(c, { scale: 0.86, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.out' })
          .fromTo(c.querySelector('[data-ripple]'), { scale: 0.4, autoAlpha: 0.9 }, { scale: 2.2, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '<')
          .to(el, { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, '<');
      } else if ('type' in s) {
        const el = field(s.type);
        const st = { n: 0 };
        tl.to(st, {
          n: s.text.length,
          duration: s.text.length * 0.05,
          ease: 'none',
          onStart: () => (st.n = 0),
          onUpdate: () => {
            if (el) el.textContent = s.text.slice(0, Math.round(st.n));
          },
        });
      } else if ('wait' in s) {
        tl.to({}, { duration: s.wait });
      } else {
        tl.call(s.call);
      }
    }
    arc(tl, c, at, start, 1.4, bow);
    return tl;
  };

  const logs = [...root.querySelectorAll<HTMLElement>('[data-log]')];
  const connect = field('connect');
  const tag = field('tag');

  const loops: gsap.core.Timeline[] = [];
  let n = 0;
  const add = (id: string, steps: Step[], delay: number, reset: () => void = () => {}) => {
    // Alternate the bow direction so the cursors' paths don't all curve the same way.
    if (visible(cursor(id))) loops.push(build(id, steps, delay, reset, n++ % 2 ? -0.18 : 0.18));
  };

  // Lyra (support): checks the ticket and the payment tool, then presses Issue refund on its own proposal.
  add(
    'rune',
    [
      { go: 'tool-zendesk' },
      { click: 'tool-zendesk' },
      { go: 'tool-stripe', d: 0.7 },
      { click: 'tool-stripe' },
      { go: 'refund-issue', d: 0.9 },
      { click: 'refund-issue' },
      { call: () => card?.classList.add('is-pending') },
      { wait: 1.8 },
    ],
    0,
    () => card?.classList.remove('is-pending'),
  );
  // Nova (sales): tags Figma as an expansion account in the customers table.
  add(
    'aether',
    [{ go: 'tag', d: 1.3 }, { click: 'tag' }, { type: 'tag', text: 'Expansion' }, { wait: 2 }],
    0.5,
    () => {
      if (tag) tag.textContent = '';
    },
  );
  // Flux (workflows): adds a step to the refund workflow, then runs it.
  add('syntax', [{ go: 'wf-node', d: 1.2 }, { click: 'wf-node' }, { wait: 0.8 }, { go: 'wf-run', d: 1 }, { click: 'wf-run' }, { wait: 1.6 }], 0.9);
  // Clara (billing): connects Stripe from the app library.
  add(
    'clara',
    [{ go: 'app-stripe', d: 1.2 }, { click: 'app-stripe' }, { go: 'app-connect', d: 0.6 }, { click: 'app-connect' }, { call: () => connect && (connect.textContent = 'Connected') }, { wait: 2 }],
    1.3,
    () => {
      if (connect) connect.textContent = 'Connect';
    },
  );
  // Atlas (ops): deploys from the terminal.
  add(
    'theo',
    [
      { go: 'term', d: 1.2 },
      { click: 'term' },
      { type: 'term', text: 'deploy api v4.1 --env production' },
      { call: () => gsap.to(logs, { autoAlpha: 1, stagger: 0.45, duration: 0.2 }) },
      { wait: 2.6 },
    ],
    0.6,
    () => {
      gsap.set(logs, { autoAlpha: 0 });
      const f = field('term');
      if (f) f.textContent = '';
    },
  );

  let parked = false;
  return {
    park() {
      if (parked) return;
      parked = true;
      loops.forEach((l) => l.pause());
      const p = point('refund-issue');
      const c = cursor('rune');
      gsap.to(c, { x: p.x, y: p.y, duration: 0.6, ease: 'power2.out' });
      gsap.to(c, { scale: 0.86, duration: 0.09, yoyo: true, repeat: 1, delay: 0.6 });
      gsap.delayedCall(0.65, () => card?.classList.add('is-pending'));
    },
    unpark() {
      if (!parked) return;
      parked = false;
      loops.forEach((l) => l.resume());
    },
    pause: () => loops.forEach((l) => l.pause()),
    resume: () => !parked && loops.forEach((l) => l.resume()),
    kill() {
      loops.forEach((l) => l.kill());
      card?.classList.remove('is-pending');
    },
  };
}

/** Reduced motion: cursors parked on their first targets, fields showing their finished text. */
export function placeAgents(root: HTMLElement) {
  const at: Record<string, string> = { rune: 'refund-issue', aether: 'tag', syntax: 'wf-run', clara: 'app-connect', theo: 'term' };
  for (const [id, name] of Object.entries(at)) {
    const c = root.querySelector<HTMLElement>(`[data-cursor="${id}"]`);
    const el = root.querySelector<HTMLElement>(`[data-target="${name}"]`);
    if (!c || !el) continue;
    const o = offsetIn(el, root);
    gsap.set(c, { x: o.x + Math.min(o.w * 0.5, 60), y: o.y + o.h * 0.55 });
  }
}
