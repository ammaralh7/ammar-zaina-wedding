"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { isPossiblePhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";
import { emailRsvpNotice } from "@/lib/notify";
import { getSupabase } from "@/lib/supabase-server";
import { wedding } from "@/lib/wedding-config";

export type RsvpErrorKey = "name" | "party" | "phone" | "notConfigured" | "generic";

export type SavedRsvp = {
  id: string;
  token: string;
  name: string;
  partySize: number;
  phone: string;
};

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; error: RsvpErrorKey }
  | { status: "saved"; rsvp: SavedRsvp };

// The page only collects who is coming: a name, a phone number and how many guests.
const rsvpSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  // Any country: the form sends E.164 (+<country code><number>)
  phone: z
    .string()
    .trim()
    .max(40, "phone")
    .refine((v) => isPossiblePhoneNumber(v), "phone"),
  partySize: z.coerce.number("party").int("party").min(1, "party").max(wedding.maxPartySize, "party"),
  locale: z.enum(["en", "ar"]).catch("en"),
  id: z.uuid().optional().or(z.literal("")),
  token: z.uuid().optional().or(z.literal("")),
});

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  // Honeypot: real guests never see or fill this field.
  if (str(formData, "website")) return { status: "error", error: "generic" };

  const parsed = rsvpSchema.safeParse({
    name: str(formData, "name"),
    phone: str(formData, "phone") ?? "",
    partySize: str(formData, "partySize") ?? "1",
    locale: str(formData, "locale"),
    id: str(formData, "id"),
    token: str(formData, "token"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    const error: RsvpErrorKey =
      message === "name" || message === "party" || message === "phone" ? message : "generic";
    return { status: "error", error };
  }

  const supabase = getSupabase();
  if (!supabase) return { status: "error", error: "notConfigured" };

  const v = parsed.data;
  const row = {
    name: v.name,
    attending: true,
    party_size: v.partySize,
    phone: v.phone,
    message: null,
    locale: v.locale,
  };

  // Returning guest editing their answer: update only if id and token match.
  let result = null;
  if (v.id && v.token) {
    const { data, error } = await supabase
      .from("rsvps")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", v.id)
      .eq("edit_token", v.token)
      .select("id, edit_token")
      .maybeSingle();
    if (error) return { status: "error", error: "generic" };
    result = data;
  }

  if (!result) {
    const { data, error } = await supabase
      .from("rsvps")
      .insert(row)
      .select("id, edit_token")
      .single();
    if (error) return { status: "error", error: "generic" };
    result = data;
  }

  refresh();

  // Sent once the guest already has their confirmation, so email never slows the form down
  const updated = Boolean(v.id && v.token && result.id === v.id);
  after(() => emailRsvpNotice({ ...row, updated }));

  return {
    status: "saved",
    rsvp: {
      id: result.id,
      token: result.edit_token,
      name: row.name,
      partySize: row.party_size,
      phone: v.phone,
    },
  };
}

// Lets a returning guest see the answer saved on their device.
export async function getMyRsvp(id: string, token: string): Promise<SavedRsvp | null> {
  const ids = z.object({ id: z.uuid(), token: z.uuid() }).safeParse({ id, token });
  const supabase = getSupabase();
  if (!ids.success || !supabase) return null;

  const { data } = await supabase
    .from("rsvps")
    .select("id, edit_token, name, party_size, phone")
    .eq("id", ids.data.id)
    .eq("edit_token", ids.data.token)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    token: data.edit_token,
    name: data.name,
    partySize: data.party_size,
    phone: data.phone ?? "",
  };
}
