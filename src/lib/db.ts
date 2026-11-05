import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Ported from sciaxo-landing. Pooled connection string, queried over HTTP: suits serverless and Node alike.
// The client is created on first use, so the site builds and renders before DATABASE_URL is set; only the
// booking routes need it (they answer with a 500 until it exists).
let client: NeonQueryFunction<false, false> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Add your Neon connection string to .env.local.');
    client = neon(url);
  }
  return client(strings, ...values);
}

let ready: Promise<unknown> | undefined;

/** Creates the table once per server instance. slot_start is UNIQUE: one booking per slot. A separate table from sciaxo's `bookings`, which lives in the same database. */
export function ensureSchema() {
  ready ??= sql`
    CREATE TABLE IF NOT EXISTS auctervia_bookings (
      id bigserial PRIMARY KEY,
      slot_start timestamptz NOT NULL UNIQUE,
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`.catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}
