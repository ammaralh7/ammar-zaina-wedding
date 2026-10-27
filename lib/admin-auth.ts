import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "wedding_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

function adminPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

// The cookie value is derived from the password, so changing
// ADMIN_PASSWORD logs every device out.
function token(password: string) {
  return createHmac("sha256", password).update("wedding-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function isAdminConfigured() {
  return Boolean(adminPassword());
}

export function passwordMatches(input: string) {
  const password = adminPassword();
  return password ? safeEqual(input, password) : false;
}

export async function isAdmin() {
  const password = adminPassword();
  if (!password) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  return value ? safeEqual(value, token(password)) : false;
}

export async function grantAdmin() {
  const password = adminPassword();
  if (!password) return;
  (await cookies()).set(COOKIE, token(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function revokeAdmin() {
  (await cookies()).delete(COOKIE);
}
