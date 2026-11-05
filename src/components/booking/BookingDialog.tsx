"use client";
// Ported from sciaxo-landing; restyled for Auctervia with a CSS module (light panel, ink actions).

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import CountrySelect from "./CountrySelect";
import TimeSelect from "./TimeSelect";
import {
  EMAIL_RE, MAX_DAYS_AHEAD, SLOT_TIMES, addDays, isBookableDate, isIstZone, isPastSlot, toDateKey, todayIst, tzLabel, userTimeZone,
} from "@/lib/booking";
import { countryByIso, defaultCountry, parsePhone } from "@/lib/phone";
import s from "./Booking.module.css";

type Field = "email" | "name" | "phone" | "message" | "slot";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const input = s.input;

const monthOf = (date: string) => ({ y: Number(date.slice(0, 4)), m: Number(date.slice(5, 7)) - 1 });
const monthStart = (y: number, m: number) => toDateKey(y, m, 1);
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

const MOBILE = "(max-width: 767px)";
const subscribeMobile = (cb: () => void) => {
  const m = matchMedia(MOBILE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useIsMobile = () => useSyncExternalStore(subscribeMobile, () => matchMedia(MOBILE).matches, () => false);

const readViewport = () => {
  const vv = window.visualViewport;
  return vv ? { bottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop), height: vv.height } : { bottom: 0, height: window.innerHeight };
};

/** Visible area of the page: shrinks when the on-screen keyboard opens, so the drawer can sit above it. */
function useVisibleViewport(enabled: boolean) {
  const [v, setV] = useState(readViewport);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;
    const update = () => setV(readViewport());
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);
  return v;
}

export default function BookingDialog({ initialEmail, onClose }: { initialEmail: string; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const close = useCallback(() => onCloseRef.current(), []);
  const panel = useRef<HTMLDivElement>(null);
  const uid = useId();
  const mobile = useIsMobile();
  const mobileAtOpen = useRef(mobile);
  const vp = useVisibleViewport(mobile);
  const dragFrom = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const initialEmailAtOpen = useRef(initialEmail);
  const today = todayIst();
  const [tz] = useState(userTimeZone);
  const showIst = !isIstZone(tz);
  const [country, setCountry] = useState(() => defaultCountry(tz));
  const last = addDays(today, MAX_DAYS_AHEAD);

  const [form, setForm] = useState({ email: initialEmail, name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [cursor, setCursor] = useState(monthOf(today));
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [load, setLoad] = useState<"loading" | "ready" | "error">("loading");
  const [refresh, setRefresh] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    // Everything behind the overlay becomes inert: no focus, no clicks, hidden from screen readers.
    const behind = [document.querySelector<HTMLElement>("header"), document.querySelector<HTMLElement>("main")].filter(Boolean) as HTMLElement[];
    const wasInert = behind.map((n) => n.inert);
    behind.forEach((n) => (n.inert = true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Phones: focus the drawer itself, so no field or button is active and the keyboard stays down.
    // Desktop: start in the first empty field.
    if (mobileAtOpen.current) panel.current?.focus({ preventScroll: true });
    else el.querySelector<HTMLElement>(initialEmailAtOpen.current ? "[name=name]" : "[name=email]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) return close();
      if (e.key !== "Tab") return;
      const items = [...el.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter(
        (n) => n.offsetParent !== null,
      );
      const first = items[0];
      const last = items[items.length - 1];
      const at = document.activeElement;
      if (!first || !last) return;
      if (e.shiftKey && (at === first || at === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && at === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      behind.forEach((n, i) => (n.inert = wasInert[i]));
      if (opener && opener.isConnected && !/^(INPUT|TEXTAREA)$/.test(opener.tagName)) opener.focus({ preventScroll: true });
    };
  }, [close]);

  // After a successful booking, leave the confirmation up for a moment, then close.
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(close, 2600);
    return () => clearTimeout(t);
  }, [sent, close]);

  // Booked slots for the month on screen.
  useEffect(() => {
    const ctl = new AbortController();
    const from = monthStart(cursor.y, cursor.m);
    const to = toDateKey(cursor.y, cursor.m, daysIn(cursor.y, cursor.m));
    fetch(`/api/availability?from=${from}&to=${to}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { booked: string[] }) => {
        setBooked(new Set(data.booked));
        setLoad("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setLoad("error");
      });
    return () => ctl.abort();
  }, [cursor, refresh]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => (er[k] ? { ...er, [k]: undefined } : er));
  };

  const goMonth = (delta: number) => {
    setLoad("loading");
    setCursor(({ y, m }) => {
      const n = new Date(Date.UTC(y, m + delta, 1));
      return { y: n.getUTCFullYear(), m: n.getUTCMonth() };
    });
  };

  const pickDate = (d: string) => {
    setDate(d);
    setErrors((er) => ({ ...er, slot: undefined }));
    if (time && (booked.has(`${d}T${time}`) || isPastSlot(d, time))) setTime("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = form.email.trim() ? "That doesn't look like an email. Try name@company.com." : "Enter your email.";
    if (!form.name.trim()) next.name = "Enter your name.";
    const phone = form.phone.trim() ? parsePhone(form.phone, country) : null;
    if (form.phone.trim() && !phone) next.phone = `Enter a valid ${countryByIso(country)?.name ?? ""} phone number, or leave it empty.`;
    if (!form.message.trim()) next.message = "Add a short message about what you'd like to discuss.";
    if (!date) next.slot = "Select a date and time.";
    else if (!time) next.slot = "Select a time slot.";
    setErrors(next);
    setServerError("");
    // Errors show in the field's placeholder, so an invalid value is cleared to let the message show.
    const bad = (["email", "name", "phone", "message"] as const).filter((k) => next[k]);
    if (bad.length) setForm((f) => ({ ...f, ...Object.fromEntries(bad.map((k) => [k, ""])) }));
    const first = (["email", "name", "phone", "message"] as const).find((k) => next[k]);
    if (first) return void root.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    if (next.slot) return;

    setSending(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: phone?.formatInternational() ?? "", date, time, timeZone: tz }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) return void setSent(true);
      if (res.status === 409) {
        setTime("");
        setErrors({ slot: data.error ?? "That time was just booked. Please pick another." });
        setRefresh((n) => n + 1);
      } else {
        setServerError("Something went wrong. Try again.");
      }
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  // Calendar cells for the month on screen (Monday first).
  const { y, m } = cursor;
  const lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
  const cells = [...Array<null>(lead).fill(null), ...Array.from({ length: daysIn(y, m) }, (_, i) => toDateKey(y, m, i + 1))];
  const canPrev = monthStart(y, m) > monthStart(monthOf(today).y, monthOf(today).m);
  const canNext = monthStart(y, m) < monthStart(monthOf(last).y, monthOf(last).m);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      className={s.overlay}
    >
      <div
        className={s.scroller}
        style={mobile ? { paddingBottom: vp.bottom } : undefined}
        onMouseDown={(e) => e.target === e.currentTarget && close()}
      >
        <div
          ref={panel}
          tabIndex={-1}
          className={s.panel}
          style={
            mobile
              ? { maxHeight: vp.height - 12, transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? "none" : "transform 200ms" }
              : undefined
          }
        >
          {/* Drawer handle (phones): drag it down to dismiss. */}
          <div
            className={s.handle}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragFrom.current = e.clientY;
              setDragging(true);
            }}
            onPointerMove={(e) => dragFrom.current !== null && setDragY(Math.max(0, e.clientY - dragFrom.current))}
            onPointerUp={() => {
              dragFrom.current = null;
              setDragging(false);
              if (dragY > 110) close();
              else setDragY(0);
            }}
            onPointerCancel={() => {
              dragFrom.current = null;
              setDragging(false);
              setDragY(0);
            }}
            aria-hidden
          >
            <span />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={s.close}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

            <form onSubmit={submit} noValidate>
              <h2 id={`${uid}-title`} className={s.title}>Book a pilot call</h2>
              <p className={s.intro}>Pick a time and tell us about the workflow you want your agents to run. We&apos;ll come prepared.</p>

              <fieldset disabled={sent} className={s.fieldset}>
              <div className={s.grid}>
                <div className={s.col}>
                  <div className={s.calHead}>
                    <h3 className={s.label}>Date and time</h3>
                    <div className={s.monthNav}>
                      <button type="button" onClick={() => goMonth(-1)} disabled={!canPrev} aria-label="Previous month" className={s.navBtn}>‹</button>
                      <span className={s.month}>{MONTHS[m]} {y}</span>
                      <button type="button" onClick={() => goMonth(1)} disabled={!canNext} aria-label="Next month" className={s.navBtn}>›</button>
                    </div>
                  </div>

                  <div className={s.weekdays}>
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d}>{d}</span>)}
                  </div>
                  <div className={s.days} role="group" aria-label="Choose a date">
                    {cells.map((d, i) => {
                      if (!d) return <span key={`b${i}`} />;
                      const bookable = isBookableDate(d);
                      const full = bookable && load === "ready" && SLOT_TIMES.every((t) => booked.has(`${d}T${t}`));
                      const none = bookable && load === "ready" && !full && SLOT_TIMES.every((t) => booked.has(`${d}T${t}`) || isPastSlot(d, t));
                      const off = !bookable || full || none || load !== "ready";
                      return (
                        <button
                          key={d} type="button" disabled={off} onClick={() => pickDate(d)}
                          aria-pressed={d === date}
                          aria-label={`${d}${full ? ", fully booked" : none ? ", no times left" : ""}`}
                          title={full ? "Fully booked" : none ? "No times left" : undefined}
                          className={`${s.day} ${d === date ? s.dayOn : ""} ${full ? s.dayFull : ""} ${d === today && d !== date ? s.today : ""}`}
                        >
                          {Number(d.slice(8))}
                        </button>
                      );
                    })}
                  </div>
                  {load === "error" && (
                    <p className={s.err}>
                      Couldn&apos;t load availability.{" "}
                      <button type="button" onClick={() => { setLoad("loading"); setRefresh((n) => n + 1); }} className={s.link}>Try again</button>
                    </p>
                  )}

                  <div className={s.timeWrap}>
                    <label className={s.label}>
                      {date ? new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }) : "Time"}
                      <span className={s.faint}> · {tzLabel(tz)}{showIst ? ", IST shown beside each time" : ""}</span>
                    </label>
                    <TimeSelect
                      date={date}
                      booked={booked}
                      value={time}
                      tz={tz}
                      invalid={!!errors.slot}
                      describedBy={errors.slot ? `${uid}-slot-err` : undefined}
                      onChange={(t) => { setTime(t); setErrors((er) => ({ ...er, slot: undefined })); }}
                    />
                  </div>
                </div>
                <div className={s.fields}>
                  {([
                    ["email", "Email", "email", "you@company.com"],
                    ["name", "Name", "text", "Your name"],
                  ] as const).map(([k, label, type, ph]) => (
                    <div key={k}>
                      <label htmlFor={`${uid}-${k}`} className={s.label}>{label}</label>
                      <input
                        id={`${uid}-${k}`} name={k} type={type} placeholder={errors[k] ?? ph} value={form[k]} onChange={set(k)}
                        autoComplete={k}
                        aria-invalid={errors[k] ? true : undefined} className={input}
                      />
                    </div>
                  ))}
                  <div>
                    <label htmlFor={`${uid}-phone`} className={s.label}>Phone (optional)</label>
                    <div className={s.phone}>
                      <CountrySelect value={country} invalid={!!errors.phone} onChange={(c) => { setCountry(c); setErrors((er) => ({ ...er, phone: undefined })); }} />
                      <input
                        id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" placeholder={errors.phone ?? "Phone number"} value={form.phone} onChange={set("phone")}
                        autoComplete="tel-national" aria-invalid={errors.phone ? true : undefined} className={input}
                      />
                    </div>
                  </div>
                  {/* The message box takes the spare height, so Confirm lines up with the time picker on the left. */}
                  <div className={s.messageWrap}>
                    <label htmlFor={`${uid}-message`} className={s.label}>Message</label>
                    <textarea
                      id={`${uid}-message`} name="message" rows={3} placeholder={errors.message ?? "Which workflow should your agents run? What tools do they touch?"}
                      value={form.message} onChange={set("message")} maxLength={2000}
                      aria-invalid={errors.message ? true : undefined}
                      className={`${input} ${s.textarea}`}
                    />
                  </div>
                  {!sent && (errors.slot || serverError) && (
                    <p id={`${uid}-slot-err`} className={s.err}>{errors.slot ?? serverError}</p>
                  )}
                  {/* Screen readers don't read placeholders as errors, so announce them here. */}
                  <p role="alert" className="sr-only">{[errors.email, errors.name, errors.phone, errors.message, errors.slot, serverError].filter(Boolean).join(" ")}</p>
                  {sent ? (
                    <div role="status" className={s.done}>
                      <span className={s.doneTick} aria-hidden>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8.5l3 3 7-7" /></svg>
                      </span>
                      <span>
                        <b>Request sent.</b> <span className={s.faint}>We&apos;ll confirm by email.</span>
                      </span>
                    </div>
                  ) : (
                    <button type="submit" disabled={sending} className={s.submit}>
                      {sending ? "Sending…" : "Confirm request"}
                    </button>
                  )}
                </div>

              </div>
              </fieldset>
            </form>
        </div>
      </div>
    </div>
  );
}
