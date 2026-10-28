"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { isPossiblePhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";
import { emailRsvpNotice } from "@/lib/notify";
import { getSupabase } from "@/lib/supabase-server";
import { wedding } from "@/lib/wedding-config";

export type RsvpErrorKey = "name" | "attending" | "party" | "phone" | "notConfigured" | "generic";

export type SavedRsvp = {
  id: string;
  token: string;
  name: string;
  attending: boolean;
  partySize: number;
  phone: string;
  message: string;
};

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; error: RsvpErrorKey }
  | { status: "saved"; rsvp: SavedRsvp };

const rsvpSchema = z
  .object({
    name: z.string().trim().min(2, "name").max(100, "name"),
    attending: z.enum(["yes", "no"], { error: "attending" }),
    partySize: z.coerce.number().int().min(0).max(wedding.maxPartySize),
    // Any country: the form sends E.164 (+<country code><number>)
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .default("")
      .refine((v) => v === "" || isPossiblePhoneNumber(v), "phone"),
    message: z.string().trim().max(500).optional().default(""),
    locale: z.enum(["en", "ar"]).catch("en"),
    id: z.uuid().optional().or(z.literal("")),
    token: z.uuid().optional().or(z.literal("")),
  })
  .refine((v) => v.attending === "no" || v.partySize >= 1, { message: "party" });

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  // Honeypot: real guests never see or fill this field.
  if (str(formData, "website")) return { status: "error", error: "generic" };

  const parsed = rsvpSchema.safeParse({
    name: str(formData, "name"),
    attending: str(formData, "attending"),
    partySize: str(formData, "partySize") ?? "0",
    phone: str(formData, "phone"),
    message: str(formData, "message"),
    locale: str(formData, "locale"),
    id: str(formData, "id"),
    token: str(formData, "token"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    const error: RsvpErrorKey =
      message === "name" || message === "attending" || message === "party" || message === "phone"
        ? message
        : "generic";
    return { status: "error", error };
  }

  const supabase = getSupabase();
  if (!supabase) return { status: "error", error: "notConfigured" };

  const v = parsed.data;
  const attending = v.attending === "yes";
  const row = {
    name: v.name,
    attending,
    party_size: attending ? v.partySize : 0,
    phone: v.phone || null,
    message: v.message || null,
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
      attending,
      partySize: row.party_size,
      phone: v.phone,
      message: v.message,
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
    .select("id, edit_token, name, attending, party_size, phone, message")
    .eq("id", ids.data.id)
    .eq("edit_token", ids.data.token)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    token: data.edit_token,
    name: data.name,
    attending: data.attending,
    partySize: data.party_size,
    phone: data.phone ?? "",
    message: data.message ?? "",
  };
}
