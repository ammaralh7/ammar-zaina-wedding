# Ammar & Zaina · Wedding RSVP

Invitation and RSVP site for **Tuesday, July 27, 2027 · Cairo, Egypt**, in English (`/en`) and Arabic (`/ar`).

- Guests reply coming / not coming, with party size, phone and a note. Replies are saved to Supabase, and each guest sees a confirmation they can edit later from the same device.
- `/en/admin` (password protected) shows the live headcount, every reply, a search box, a status filter, delete, and CSV export.
- The UI is built from real [21st.dev](https://21st.dev) registry components in `components/ui` (cloth-peel reveal, sparkles, text shimmer and reveal, animated countdown, fireworks, falling pattern, scroll word reveal, scroll timeline, guest selector, confetti, count-up, datatable). The theme is 21st's "Honey Glow Gold".

## Edit the details

- `lib/wedding-config.ts`: date and time, map link, max party size, and whether the public headcount is shown.
- `lib/dictionaries.ts`: all wording in English and Arabic, including the venue and the evening schedule.

## Setup

1. **Supabase** ([supabase.com](https://supabase.com), sign in with GitHub): create a project (Frankfurt is the closest region to Cairo). Open **SQL Editor**, paste in `supabase/schema.sql`, and run it.
2. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API keys; use the secret **service_role** key)
   - `ADMIN_PASSWORD`: any password you choose for the admin page
3. Run it locally:

   ```bash
   npm install
   npm run dev
   ```

   Then open http://localhost:3000.

## Deploy (Vercel + Supabase)

1. On [vercel.com](https://vercel.com), sign in with GitHub, then **Add New → Project → Import** this repo and deploy.
2. In the Vercel project, open **Storage → Create Database → Supabase** and connect it to the project. This adds the Supabase environment variables for you.
3. In **Settings → Environment Variables**, add `ADMIN_PASSWORD`.
4. **Deployments → Redeploy.** Every build runs `scripts/migrate.mjs`, which creates the `rsvps` table from `supabase/schema.sql` when a database URL is present, so there is no SQL to paste.

To get an email for every new or changed RSVP, create a free [Resend](https://resend.com) account with the address that should receive them, make an API key, and add `RESEND_API_KEY` and `RSVP_NOTIFY_EMAIL` (that same address) in **Settings → Environment Variables**, then redeploy. Without a domain of your own, Resend only delivers to the address the account was created with.

A daily Vercel cron (`vercel.json`) calls `/api/keepalive`, which runs one count query so a free Supabase project is never paused for inactivity. To make that endpoint answer only Vercel, add a `CRON_SECRET` environment variable with any random value.

Send guests the `https://<project>.vercel.app` link: it opens the Arabic version (set `defaultLocale` in `lib/wedding-config.ts` to change that), and `/en` opens the English version directly. The site also accepts the manual Supabase variables from `.env.example`.
