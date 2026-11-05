import { isValidPhoneNumber } from "libphonenumber-js/min";
import { EMAIL_RE, PHONE_RE, isBookableDate, isPastSlot, isSlotTime, isValidTimeZone, slotInstant } from "@/lib/booking";
import { ensureSchema, sql } from "@/lib/db";
import { sendBookingEmail } from "@/lib/email";

const bad = (error: string, status = 400) => Response.json({ error }, { status });

/** POST /api/bookings: saves the slot (one booking per slot), then emails the team. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return bad("Send the booking as JSON.");

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const name = str("name"), email = str("email"), phone = str("phone"), message = str("message"), date = str("date"), time = str("time");
  const timeZone = isValidTimeZone(str("timeZone")) ? str("timeZone") : null;

  if (!name || name.length > 100) return bad("Enter your name.");
  if (!EMAIL_RE.test(email) || email.length > 254) return bad("Enter a valid email address.");
  if (phone && !(PHONE_RE.test(phone) && isValidPhoneNumber(phone))) return bad("Enter a valid phone number, or leave it empty.");
  if (!message || message.length > 2000) return bad("Add a short message (up to 2000 characters).");
  if (!isBookableDate(date) || !isSlotTime(time)) return bad("Pick a weekday slot between 10 AM and 2 PM or 4 PM and 7 PM IST.");
  if (isPastSlot(date, time)) return bad("That time has already passed.");

  try {
    await ensureSchema();
    const inserted = await sql`
      INSERT INTO auctervia_bookings (slot_start, name, email, phone, message)
      VALUES (${slotInstant(date, time).toISOString()}, ${name}, ${email}, ${phone || null}, ${message})
      ON CONFLICT (slot_start) DO NOTHING
      RETURNING id`;
    if (inserted.length === 0) return bad("That time was just booked. Please pick another.", 409);

    try {
      const emailId = await sendBookingEmail({ name, email, phone: phone || null, message, date, time, timeZone });
      console.log(`booking ${inserted[0].id} saved, notification email ${emailId}`);
    } catch (e) {
      // A booking the team never hears about is worse than none: free the slot so the visitor can retry.
      console.error("booking email failed, releasing the slot", e);
      await sql`DELETE FROM auctervia_bookings WHERE id = ${inserted[0].id}`;
      return bad("We couldn't send your request. Please try again in a moment.", 502);
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("booking failed", e);
    return bad("Something went wrong. Please try again.", 500);
  }
}
