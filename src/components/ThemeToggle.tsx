'use client';
// Alt/Option + D toggles dark mode. Uses event.code because Option+D types a different character on a Mac.
// The choice is remembered; the layout's head script applies it before first paint. A short `theming` class
// cross-fades colours for the switch only, and a polite live region announces the new mode.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import s from './ThemeToggle.module.css';

const modes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;
type Mode = (typeof modes)[number]['value'];
const subscribe = (notify: () => void) => {
  addEventListener('themechange', notify);
  return () => removeEventListener('themechange', notify);
};

export function ThemeSelector() {
  const mode = useSyncExternalStore(subscribe, () => document.documentElement.dataset.colorMode ?? 'system', () => 'system');
  return (
    <div className={s.selector} role="group" aria-label="Color mode">
      {modes.map(({ value, label, Icon }) => (
        <button key={value} type="button" aria-label={`${label} color mode`} aria-pressed={mode === value}
          title={label} onClick={() => dispatchEvent(new CustomEvent('color-mode', { detail: value }))}>
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = (mode: Mode) => {
      const root = document.documentElement;
      root.dataset.colorMode = mode;
      root.dataset.theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
      dispatchEvent(new Event('themechange'));
    };
    const select = (mode: Mode) => {
      const root = document.documentElement;
      root.classList.add('theming');
      apply(mode);
      clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove('theming'), 350);
      setStatus(mode === 'system' ? 'System color mode on' : `${mode === 'dark' ? 'Dark' : 'Light'} mode on`);
      try {
        localStorage.setItem('theme', mode);
      } catch {
        /* private mode: the toggle still works for this visit */
      }
    };
    const onSelect = (event: Event) => {
      const mode = (event as CustomEvent).detail;
      if (modes.some((item) => item.value === mode)) select(mode);
    };
    const onSystem = () => {
      if (document.documentElement.dataset.colorMode === 'system') apply('system');
    };
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.code !== 'KeyD' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      select(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    };
    addEventListener('keydown', onKey);
    addEventListener('color-mode', onSelect);
    media.addEventListener('change', onSystem);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('color-mode', onSelect);
      media.removeEventListener('change', onSystem);
      clearTimeout(timer);
      document.documentElement.classList.remove('theming');
    };
  }, []);

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {status}
    </p>
  );
}
