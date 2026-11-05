// Booking rules shared by the dialog (browser) and the API routes (server). Pure functions only.
// All dates are calendar dates in IST (Asia/Kolkata, UTC+5:30, no daylight saving) as "YYYY-MM-DD".

export const IST_OFFSET_MIN = 330;
export const MAX_DAYS_AHEAD = 60;

/** Weekdays, IST: 10:00 to 14:00 and 16:00 to 19:00 in 30-minute slots (start times). */
export const SLOT_TIMES = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
] as const;
export type SlotTime = (typeof SLOT_TIMES)[number];

const pad = (n: number) => String(n).padStart(2, "0");

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+()\d\s-]{6,20}$/;

export const toDateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** A Date whose UTC fields read as the current wall clock in IST. */
const istWallClock = () => new Date(Date.now() + IST_OFFSET_MIN * 60_000);

export function todayIst(): string {
  const n = istWallClock();
  return toDateKey(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

export function isWeekday(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day >= 1 && day <= 5;
}

/** The exact instant a slot starts. */
export const slotInstant = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);

export const isSlotTime = (time: string): time is SlotTime => (SLOT_TIMES as readonly string[]).includes(time);

export const isPastSlot = (date: string, time: string) => slotInstant(date, time).getTime() <= Date.now();

/** A day can take bookings when it is a weekday inside the booking window. */
export function isBookableDate(date: string): boolean {
  const today = todayIst();
  return isValidDate(date) && isWeekday(date) && date >= today && date <= addDays(today, MAX_DAYS_AHEAD);
}

/** Slots that are still open on a date, given the booked slot keys ("YYYY-MM-DDTHH:mm"). */
export function openSlots(date: string, booked: ReadonlySet<string>): SlotTime[] {
  if (!isBookableDate(date)) return [];
  return SLOT_TIMES.filter((t) => !booked.has(`${date}T${t}`) && !isPastSlot(date, t));
}

export function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

export function formatSlot(date: string, time: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return `${day}, ${to12h(time)} IST`;
}

// ---- Visitor's time zone: slots are defined in IST but shown converted to where the visitor is ----

const IST_ZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"]);
export const isIstZone = (tz: string) => IST_ZONES.has(tz);

export function userTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return !tz || isIstZone(tz) ? "Asia/Kolkata" : tz;
  } catch {
    return "Asia/Kolkata";
  }
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Short zone name at that moment: "IST", "PST", "GMT+1"... */
export function tzLabel(tz: string, at: Date = new Date()): string {
  if (isIstZone(tz)) return "IST";
  const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(at).find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
}

/** A slot in the visitor's time zone, plus whether it falls on the previous or next calendar day there. */
export function localParts(date: string, time: string, tz: string) {
  const at = slotInstant(date, time);
  const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(at);
  const day = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: tz }).format(at);
  return { clock, shift: day === date ? 0 : day < date ? -1 : 1 };
}

/** "Mon, 9 Nov, 3:30 PM PST" in the visitor's zone. */
export function formatSlotLocal(date: string, time: string, tz: string): string {
  const at = slotInstant(date, time);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(at);
  return `${day}, ${localParts(date, time, tz).clock} ${tzLabel(tz, at)}`;
}
