import "server-only";
import { getSupabase } from "@/lib/supabase-server";

export type RsvpRow = {
  id: string;
  name: string;
  attending: boolean;
  party_size: number;
  phone: string | null;
  message: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
};

export type RsvpStats = {
  guests: number;
  accepted: number;
  declined: number;
  replies: number;
};

export const RSVP_COLUMNS = "id, name, attending, party_size, phone, message, locale, created_at, updated_at";

export async function listRsvps(): Promise<RsvpRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("rsvps")
    .select(RSVP_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load RSVPs: ${error.message}`);
  return data;
}

export function computeStats(rows: RsvpRow[]): RsvpStats {
  let guests = 0;
  let accepted = 0;
  for (const row of rows) {
    if (row.attending) {
      accepted += 1;
      guests += row.party_size;
    }
  }
  return { guests, accepted, declined: rows.length - accepted, replies: rows.length };
}

// Public number only: total people coming.
export async function getAttendingGuestCount(): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("rsvps").select("party_size").eq("attending", true);
  if (error) return null;
  return data.reduce((sum, row) => sum + row.party_size, 0);
}
