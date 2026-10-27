import { wedding } from "@/lib/wedding-config";

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET() {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ammar & Zaina//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:ammar-zaina-wedding-20270727@wedding",
    `DTSTAMP:${icsDate("2026-10-27T00:00:00Z")}`,
    `DTSTART:${icsDate(wedding.startsAt)}`,
    `DTEND:${icsDate(wedding.endsAt)}`,
    "SUMMARY:Ammar & Zaina's Wedding",
    "LOCATION:Cairo\\, Egypt",
    "DESCRIPTION:Venue to be announced.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ammar-zaina-wedding.ics"',
    },
  });
}
