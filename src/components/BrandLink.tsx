'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FileCode2, Image as ImageIcon } from 'lucide-react';
import { Mark } from './Logo';
import s from './BrandLink.module.css';

async function png(svg: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth * 3;
    canvas.height = image.naturalHeight * 3;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function BrandLink({ className, size = 24 }: { className: string; size?: number }) {
  const link = useRef<HTMLAnchorElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const open = (x: number, y: number) => {
    setError('');
    setStatus('');
    setPosition({ x: Math.max(8, Math.min(x, innerWidth - 256)), y: Math.max(8, Math.min(y, innerHeight - 208)) });
  };

  useEffect(() => {
    if (!position) return;
    menu.current?.querySelector('button')?.focus();
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setPosition(null);
    };
    const close = () => setPosition(null);
    const scroll = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) setPosition(null);
    };
    addEventListener('pointerdown', outside);
    addEventListener('resize', close);
    addEventListener('scroll', scroll, true);
    return () => {
      removeEventListener('pointerdown', outside);
      removeEventListener('resize', close);
      removeEventListener('scroll', scroll, true);
    };
  }, [position]);

  const copy = async (wordmark: boolean, format: 'svg' | 'png') => {
    if (!link.current || busy) return;
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      setError('Clipboard copying isn’t supported in this browser.');
      return;
    }
    setBusy(true);
    setError('');
    const mark = link.current.querySelector('svg')!.cloneNode(true) as SVGSVGElement;
    mark.removeAttribute('class');
    mark.removeAttribute('aria-hidden');
    mark.setAttribute('width', '48');
    mark.setAttribute('height', '48');
    mark.setAttribute('fill', getComputedStyle(link.current).color);
    const content = (async () => {
      let svg = mark;
      if (wordmark) {
        const response = await fetch('/brand/wordmark.svg');
        if (!response.ok) throw new Error('Logo unavailable');
        svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement as unknown as SVGSVGElement;
        svg.setAttribute('fill', mark.getAttribute('fill')!);
        mark.setAttribute('width', '40');
        mark.setAttribute('height', '40');
        mark.setAttribute('y', '4');
        svg.prepend(mark);
      }
      const text = new XMLSerializer().serializeToString(svg);
      return format === 'png' ? png(text) : new Blob([text], { type: 'text/plain' });
    })();
    try {
      // Supply the promise immediately so clipboard writes retain the click's user activation.
      await navigator.clipboard.write([new ClipboardItem({ [format === 'png' ? 'image/png' : 'text/plain']: content })]);
      setStatus(`${wordmark ? 'Logo' : 'Logomark'} copied as ${format.toUpperCase()}.`);
      if (menu.current) link.current?.focus();
      setPosition(null);
    } catch {
      setError('Couldn’t copy this asset. Try again or allow clipboard access.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link href="/" ref={link} className={className} aria-label="Auctervia home" aria-description="Right-click or press Shift+F10 for logo copy options."
        onContextMenu={(event) => { event.preventDefault(); open(event.clientX, event.clientY); }}
        onKeyDown={(event) => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            open(rect.left, rect.bottom + 8);
          }
        }}>
        <Mark size={size} /><span>Auctervia</span>
      </Link>
      <span className="sr-only" role="status">{status}</span>
      {position && createPortal(
        <div ref={menu} className={s.menu} role="menu" aria-label="Copy Auctervia brand assets" style={{ left: position.x, top: position.y }}
          onKeyDown={(event) => {
            const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
            const index = items.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === 'Escape' || event.key === 'Tab') {
              if (event.key === 'Escape') event.preventDefault();
              setPosition(null);
              link.current?.focus();
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
              items[next]?.focus();
            }
          }}>
          {(['svg', 'png'] as const).map((format) => (
            <div key={format} role="none">
              {format === 'png' && <div role="separator" className={s.separator} />}
              {[true, false].map((wordmark) => (
                <button key={String(wordmark)} type="button" role="menuitem" disabled={busy} onClick={() => copy(wordmark, format)}>
                  {format === 'svg' ? <FileCode2 size={16} aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />}
                  Copy {wordmark ? 'logo' : 'logomark'} as {format.toUpperCase()}
                </button>
              ))}
            </div>
          ))}
          {error && <p role="alert" className={s.error}>{error}</p>}
        </div>, document.body,
      )}
    </>
  );
}
