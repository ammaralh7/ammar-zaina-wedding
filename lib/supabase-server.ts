import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Service-role client. RLS on the rsvps table has no policies, so this
// server-only client is the only way in.
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  // Names cover both a manual setup and Vercel's Supabase integration
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  client =
    url && key
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return client;
}
