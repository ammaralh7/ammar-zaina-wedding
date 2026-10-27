import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import { deleteRsvp, logout, refreshGuestList } from "@/app/[lang]/admin/actions";
import { AdminStats } from "@/components/admin/admin-stats";
import { LoginForm } from "@/components/admin/login-form";
import { Button } from "@/components/ui/button";
import { Datatable1 } from "@/components/ui/datatable-1";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { computeStats, listRsvps } from "@/lib/rsvp";
import { getSupabase } from "@/lib/supabase-server";
import { isLocale, type Locale } from "@/lib/wedding-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function AdminContent({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  await connection();
  if (!isAdminConfigured() || !getSupabase()) {
    return <p className="rounded-2xl border border-dashed border-gold-soft p-8 text-center">{dict.admin.notConfigured}</p>;
  }
  if (!(await isAdmin())) return <LoginForm copy={dict.admin} />;

  const rows = (await listRsvps()) ?? [];
  const stats = computeStats(rows);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <form action={refreshGuestList}>
          <Button type="submit" variant="outline" className="rounded-full border-gold-soft">
            <RefreshCw data-icon="inline-start" />
            {dict.admin.refresh}
          </Button>
        </form>
        <form action={logout}>
          <Button type="submit" variant="ghost" className="rounded-full">
            <LogOut data-icon="inline-start" className="rtl:-scale-x-100" />
            {dict.admin.logout}
          </Button>
        </form>
      </div>
      <AdminStats stats={stats} copy={dict.admin.stats} />
      <Datatable1
        rows={rows.map((r) => ({
          id: r.id,
          name: r.name,
          attending: r.attending,
          partySize: r.party_size,
          phone: r.phone,
          message: r.message,
          createdAt: r.created_at,
        }))}
        labels={{ ...dict.admin.table, exportCsv: dict.admin.exportCsv }}
        locale={lang}
        exportHref="/api/admin/export"
        onDelete={deleteRsvp}
      />
    </div>
  );
}

export default async function AdminPage({ params }: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_top,#fbf0d6_0%,var(--background)_60%)] px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="text-center">
          <Link href={`/${lang}`} className="font-script text-4xl text-gold-deep">
            {dict.nav.monogram}
          </Link>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">{dict.admin.title}</h1>
          <p className="mt-2 text-muted-foreground">{dict.admin.subtitle}</p>
        </header>
        <Suspense fallback={<Loader2 className="mx-auto size-8 animate-spin text-gold-deep" />}>
          <AdminContent dict={dict} lang={lang} />
        </Suspense>
      </div>
    </main>
  );
}
