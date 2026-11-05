// Isometric hairline figures, after the deck's figures: white prisms, ink hairlines, no shadows.
// World axes: x runs down-right, y runs down-left, z is up. Faces at +x and +y are the visible ones.
import type { SVGProps } from 'react';

const C = Math.cos(Math.PI / 6);
const S = 0.5;
export type P = [number, number];
export const iso = (x: number, y: number, z = 0): P => [(x - y) * C, (x + y) * S - z];
export const pts = (ps: P[]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
/** Screen offset for moving `d` units along the world x axis (use for GSAP x/y). */
export const alongX = (d: number) => ({ x: d * C, y: d * S });

type BoxProps = { x: number; y: number; z?: number; w: number; d: number; h: number } & Omit<SVGProps<SVGGElement>, 'x' | 'y' | 'z' | 'w' | 'd' | 'h'>;

export function Box({ x, y, z = 0, w, d, h, children, ...rest }: BoxProps) {
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const right = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
  return (
    <g {...rest}>
      <polygon points={pts(left)} className="iso-l iso-line" />
      <polygon points={pts(right)} className="iso-r iso-line" />
      <polygon points={pts(top)} className="iso-top iso-line" />
      {children}
    </g>
  );
}

export function CrateGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--reveal-blue)' }} />
        <stop offset="0.52" style={{ stopColor: 'var(--reveal-coral)' }} />
        <stop offset="1" style={{ stopColor: 'var(--reveal-amber)' }} />
      </linearGradient>
    </defs>
  );
}

/** A 2×2 dot stamp on a box lid (the deck's "stamped" mark). */
export function Stamp({ x, y, z, size, ...rest }: { x: number; y: number; z: number; size: number } & Omit<SVGProps<SVGGElement>, 'x' | 'y' | 'z'>) {
  const q = size / 3;
  return (
    <g {...rest}>
      {[1, 2].flatMap((i) =>
        [1, 2].map((j) => {
          const [cx, cy] = iso(x + i * q, y + j * q, z);
          return <circle key={`${i}${j}`} cx={cx} cy={cy} r={2.4} />;
        }),
      )}
    </g>
  );
}

/** An isometric ellipse (a ring on the ground plane) as a path. */
export function ringPath(cx: number, cy: number, z: number, r: number) {
  const n = 40;
  const ps: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ps.push(iso(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
  }
  return `M${pts(ps).replace(/ /g, ' L')} Z`;
}
