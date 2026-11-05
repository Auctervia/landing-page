"use client";
// Ported from sciaxo-landing; restyled for Auctervia.

import { useEffect, useId, useRef, useState } from "react";
import { SLOT_TIMES, isIstZone, isPastSlot, localParts, to12h, tzLabel, slotInstant } from "@/lib/booking";
import s from "./Booking.module.css";

type Props = {
  date: string;
  booked: ReadonlySet<string>;
  value: string;
  onChange: (time: string) => void;
  tz: string;
  invalid?: boolean;
  describedBy?: string;
};

/** Custom listbox for the time slot: shown in the visitor's zone, with IST alongside when the zones differ. */
export default function TimeSelect({ date, booked, value, onChange, tz, invalid, describedBy }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const showIst = !isIstZone(tz);
  const options = SLOT_TIMES.map((t) => ({ t, ok: !booked.has(`${date}T${t}`) && !isPastSlot(date, t), taken: booked.has(`${date}T${t}`) }));
  const label = (t: string) => {
    const { clock, shift } = localParts(date, t, tz);
    return { clock, note: shift < 0 ? "previous day" : shift > 0 ? "next day" : "" };
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) (list.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    const sel = options.findIndex((o) => o.t === value && o.ok);
    setActive(sel >= 0 ? sel : options.findIndex((o) => o.ok));
    setOpen(true);
  }
  function move(dir: 1 | -1) {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (options[i].ok) return void setActive(i);
    }
  }
  function choose(i: number) {
    if (!options[i]?.ok) return;
    onChange(options[i].t);
    setOpen(false);
    button.current?.focus();
  }

  const current = value ? label(value) : null;

  return (
    <div ref={root} className={s.rel}>
      <button
        ref={button}
        type="button"
        disabled={!date}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        data-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`${s.input} ${s.selectBtn}`}
      >
        <span className={current ? "" : s.faint}>
          {!date ? "Pick a date first" : current ? `${current.clock} ${tzLabel(tz, slotInstant(date, value))}` : "Select a time"}
          {current?.note && <span className={s.note}>{current.note}</span>}
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${s.chev} ${open ? s.flip : ""}`} aria-hidden>
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label="Available times"
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          onKeyDown={(e) => {
            const firstOk = options.findIndex((o) => o.ok);
            const lastOk = options.map((o) => o.ok).lastIndexOf(true);
            const handled = ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"];
            if (handled.includes(e.key)) e.preventDefault();
            if (e.key === "ArrowDown") move(1);
            else if (e.key === "ArrowUp") move(-1);
            else if (e.key === "Home") setActive(firstOk);
            else if (e.key === "End") setActive(lastOk);
            else if (e.key === "Enter" || e.key === " ") choose(active);
            else if (e.key === "Escape") {
              e.stopPropagation(); // keep Escape from also closing the whole dialog
              setOpen(false);
              button.current?.focus();
            } else if (e.key === "Tab") setOpen(false);
          }}
          className={`${s.pop} ${s.popUp}`}
        >
          {options.map((o, i) => {
            const { clock, note } = label(o.t);
            return (
              <li
                key={o.t}
                id={`${id}-${i}`}
                role="option"
                aria-selected={o.t === value}
                aria-disabled={!o.ok}
                onClick={() => choose(i)}
                onMouseMove={() => o.ok && active !== i && setActive(i)}
                className={`${s.opt} ${!o.ok ? s.optOff : i === active ? s.optOn : ""}`}
              >
                <span className={o.taken ? s.strike : ""}>
                  {clock}
                  {note && <span className={s.note}>{note}</span>}
                </span>
                <span className={s.optMeta}>{o.taken ? "Booked" : !o.ok ? "Passed" : showIst ? `${to12h(o.t)} IST` : o.t === value ? "✓" : ""}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
