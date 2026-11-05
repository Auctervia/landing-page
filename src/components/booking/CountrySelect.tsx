"use client";
// Ported from sciaxo-landing; restyled for Auctervia.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import { countries, countryByIso } from "@/lib/phone";
import s from "./Booking.module.css";

/** Custom country picker for the phone field: flag and calling code on the button, searchable list in the popover. */
export default function CountrySelect({ value, onChange, invalid }: { value: CountryCode; onChange: (iso: CountryCode) => void; invalid?: boolean }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const current = countryByIso(value);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return countries();
    return countries().filter((c) => c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q || c.dial.startsWith(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open) (list.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    setQuery("");
    setActive(Math.max(0, countries().findIndex((c) => c.iso === value)));
    setOpen(true);
  }
  function close(refocus = true) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }
  function choose(i: number) {
    const c = shown[i];
    if (!c) return;
    onChange(c.iso);
    close();
  }

  return (
    <div ref={root} className={`${s.rel} ${s.noShrink}`}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`Country code, ${current?.name ?? ""} plus ${current?.dial ?? ""}`}
        data-invalid={invalid ? true : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`${s.input} ${s.countryBtn}`}
      >
        <span className={s.flag} aria-hidden>{current?.flag}</span>
        <span className={s.dial}>+{current?.dial}</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${s.chev} ${open ? s.flip : ""}`} aria-hidden>
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className={`${s.pop} ${s.countryPop}`}>
          <div className={s.searchWrap}>
            <input
              ref={search}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={`${id}-list`}
              aria-activedescendant={shown.length ? `${id}-${active}` : undefined}
              aria-label="Search countries"
              placeholder="Search country or code"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(shown.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault(); // don't submit the booking form
                  choose(active);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation(); // keep Escape from also closing the whole dialog
                  close();
                } else if (e.key === "Tab") {
                  close(false);
                }
              }}
              className={`${s.input} ${s.search}`}
            />
          </div>
          <ul ref={list} id={`${id}-list`} role="listbox" aria-label="Countries" className={s.countryList}>
            {shown.length === 0 && <li className={s.empty}>No country matches “{query}”.</li>}
            {shown.map((c, i) => (
              <li
                key={c.iso}
                id={`${id}-${i}`}
                role="option"
                aria-selected={c.iso === value}
                onClick={() => choose(i)}
                onMouseMove={() => active !== i && setActive(i)}
                className={`${s.opt} ${i === active ? s.optOn : ""}`}
              >
                <span className={s.flag} aria-hidden>{c.flag}</span>
                <span className={s.countryName}>{c.name}</span>
                <span className={s.optMeta}>+{c.dial}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
