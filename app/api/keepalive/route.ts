import { pingDatabase } from "@/lib/rsvp";

// Called once a day by the Vercel cron in vercel.json. When CRON_SECRET is
// set, Vercel sends it as a bearer token and anyone else is turned away.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ok = await pingDatabase();
  return Response.json({ ok }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
