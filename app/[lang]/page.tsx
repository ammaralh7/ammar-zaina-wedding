import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ScrollWordReveal } from "@/components/ui/motion-scroll-word-reveal";
import { CountdownSection } from "@/components/wedding/countdown-section";
import { Details } from "@/components/wedding/details";
import { HeadcountBadge } from "@/components/wedding/headcount";
import { Hero } from "@/components/wedding/hero";
import { RsvpSection } from "@/components/wedding/rsvp-section";
import { Schedule } from "@/components/wedding/schedule";
import { SiteFooter } from "@/components/wedding/site-footer";
import { SiteNav } from "@/components/wedding/site-nav";
import { VerseSection } from "@/components/wedding/verse-section";
import { getDictionary } from "@/lib/dictionaries";
import { getAttendingGuestCount } from "@/lib/rsvp";
import { isLocale, wedding } from "@/lib/wedding-config";

async function PublicHeadcount({ label }: { label: string }) {
  // Always read live numbers at request time
  await connection();
  const count = await getAttendingGuestCount();
  if (count === null) return null;
  return <HeadcountBadge count={count} label={label} />;
}

export default async function InvitationPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <SiteNav copy={dict.nav} lang={lang} />
      <main>
        <Hero copy={dict.hero} lang={lang} />
        {wedding.showVerse ? <VerseSection copy={dict.verse} /> : null}
        <div id="invitation">
          <ScrollWordReveal
            text={dict.invitation.text}
            kicker={dict.invitation.kicker}
            headingClassName="font-serif text-foreground"
          />
        </div>
        <CountdownSection copy={dict.countdown}>
          {wedding.showPublicHeadcount ? (
            <Suspense fallback={null}>
              <PublicHeadcount label={dict.countdown.headcount} />
            </Suspense>
          ) : null}
        </CountdownSection>
        <Details copy={dict.details} rsvpLabel={dict.nav.rsvp} />
        <Schedule copy={dict.schedule} />
        <RsvpSection copy={dict.rsvp} confirmation={dict.confirmation} lang={lang} />
      </main>
      <SiteFooter copy={dict.footer} names={dict.hero.names} />
    </>
  );
}
