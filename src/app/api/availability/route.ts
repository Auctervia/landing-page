import { addDays, isValidDate } from "@/lib/booking";
import { ensureSchema, sql } from "@/lib/db";

/** GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD → { booked: ["2026-11-05T10:30", ...] } (IST slot keys). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  if (!isValidDate(from) || !isValidDate(to) || to < from || to > addDays(from, 100)) {
    return Response.json({ error: "Give a valid from and to date, at most 100 days apart." }, { status: 400 });
  }
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT to_char(slot_start AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI') AS slot
      FROM auctervia_bookings
      WHERE slot_start >= ${`${from}T00:00:00+05:30`}::timestamptz
        AND slot_start < ${`${addDays(to, 1)}T00:00:00+05:30`}::timestamptz
      ORDER BY slot_start`;
    return Response.json({ booked: rows.map((r) => r.slot as string) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("availability failed", e);
    return Response.json({ error: "Couldn't load availability." }, { status: 500 });
  }
}
