// Applies supabase/schema.sql before each build, so a fresh Supabase database
// (e.g. one added through Vercel's Supabase integration) gets the rsvps table
// without anyone pasting SQL. The schema is idempotent. Skips when no database
// URL is configured, and never fails the build: the site still deploys.
import { readFile } from "node:fs/promises";
import pg from "pg";

const raw =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!raw) {
  console.log("[migrate] No database URL set; skipping schema setup.");
  process.exit(0);
}

// Supabase uses a certificate chain node-postgres can't verify by default;
// drop sslmode from the URL and pass the TLS options explicitly.
const url = new URL(raw);
url.searchParams.delete("sslmode");

const sql = await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("[migrate] rsvps table is ready.");
} catch (error) {
  console.warn("[migrate] Could not apply supabase/schema.sql:", error.message);
} finally {
  await client.end().catch(() => {});
}
