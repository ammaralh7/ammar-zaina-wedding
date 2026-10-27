"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { grantAdmin, isAdmin, passwordMatches, revokeAdmin } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase-server";

export type LoginState = { error: "wrongPassword" | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    return { error: "wrongPassword" };
  }
  await grantAdmin();
  return { error: null };
}

export async function logout() {
  await revokeAdmin();
}

export async function deleteRsvp(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const parsed = z.uuid().safeParse(id);
  const supabase = getSupabase();
  if (!parsed.success || !supabase) return;
  await supabase.from("rsvps").delete().eq("id", parsed.data);
  refresh();
}

export async function refreshGuestList() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  refresh();
}
