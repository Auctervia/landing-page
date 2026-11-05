import "server-only";
// Ported from sciaxo-landing. Set RESEND_API_KEY, RESEND_FROM and BOOKING_NOTIFY_EMAIL to send for real.
import { formatSlot, formatSlotLocal, isIstZone } from "./booking";

type Booking = { name: string; email: string; phone: string | null; message: string; date: string; time: string; timeZone?: string | null };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Who gets the notification: BOOKING_NOTIFY_EMAIL, comma-separated. */
const recipients = () =>
  (process.env.BOOKING_NOTIFY_EMAIL || "hello@auctervia.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

/** Tells the team about a new call request, through Resend's REST API. Throws if it isn't accepted. */
export async function sendBookingEmail(b: Booking): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const when = formatSlot(b.date, b.time);

  const rows: [string, string][] = [
    ["When", when],
    ...(b.timeZone && !isIstZone(b.timeZone) ? ([["Their time", `${formatSlotLocal(b.date, b.time, b.timeZone)} (${b.timeZone})`]] as [string, string][]) : []),
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone || "Not given"],
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 4px">New pilot call request</h2>
<p style="margin:0 0 16px;color:#555">${esc(b.name)} would like to meet on <b>${esc(when)}</b>.</p>
<table style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#777">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="margin:16px 0 4px;color:#777">Message</p>
<p style="margin:0;white-space:pre-wrap">${esc(b.message)}</p>
<p style="margin:20px 0 0;color:#999;font-size:13px">Reply to this email to reach ${esc(b.name)} directly.</p></div>`;
  const text = `New call request\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${b.message}\n`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Auctervia <onboarding@resend.dev>",
      to: recipients(),
      reply_to: b.email,
      subject: `Pilot call request: ${b.name}, ${when}`,
      html,
      text,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok || !body.id) throw new Error(`Resend rejected the email (${res.status}): ${body.message ?? "no detail"}`);
  return body.id;
}
