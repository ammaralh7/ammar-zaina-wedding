import "server-only";

export type RsvpNotice = {
  name: string;
  attending: boolean;
  party_size: number;
  phone: string | null;
  message: string | null;
  locale: string;
  updated: boolean;
};

const LANGUAGES: Record<string, string> = { ar: "Arabic", en: "English" };

// Emails the couple about each new or changed RSVP through Resend
// (https://resend.com). Needs RESEND_API_KEY and RSVP_NOTIFY_EMAIL (comma
// separated for several people); without them it does nothing, so the form
// never depends on email working.
export async function emailRsvpNotice(rsvp: RsvpNotice) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.RSVP_NOTIFY_EMAIL;
  if (!key || !to) return;

  const name = rsvp.name.replace(/\s+/g, " ");
  const guests = `${rsvp.party_size} ${rsvp.party_size === 1 ? "guest" : "guests"}`;
  const subject = `${rsvp.updated ? "Updated RSVP" : "New RSVP"}: ${name}, ${rsvp.attending ? `coming (${guests})` : "can't come"}`;
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const site = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  const text = [
    rsvp.updated ? "A guest changed their RSVP." : "A guest just replied.",
    "",
    `Name: ${name}`,
    `Coming: ${rsvp.attending ? `Yes, ${guests}` : "No"}`,
    `Phone: ${rsvp.phone || "not given"}`,
    `Message: ${rsvp.message || "none"}`,
    `Language: ${LANGUAGES[rsvp.locale] ?? rsvp.locale}`,
    `Time: ${when} (Cairo)`,
    ...(site ? ["", `Every reply: https://${site}/ar/admin`] : []),
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Resend's shared sender works without a domain of your own, but only
        // delivers to the address the Resend account was created with
        from: process.env.RESEND_FROM || "Wedding RSVP <onboarding@resend.dev>",
        to: to.split(",").map((address) => address.trim()),
        subject,
        text,
      }),
    });
    if (!res.ok) console.error("[notify] Resend refused the RSVP email:", res.status, await res.text());
  } catch (error) {
    console.error("[notify] Could not reach Resend:", error);
  }
}
