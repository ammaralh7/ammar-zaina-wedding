"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Minus, Pencil, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { getMyRsvp, submitRsvp, type RsvpState, type SavedRsvp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput, PhoneInputCountrySelect, PhoneInputField } from "@/components/ui/phone-input";
import { fill, type Dictionary } from "@/lib/dictionaries";
import { wedding, type Locale } from "@/lib/wedding-config";

const STORAGE_KEY = "az-wedding-rsvp";

function readStored(): { id: string; token: string } | null {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return value?.id && value?.token ? value : null;
  } catch {
    return null;
  }
}

function writeStored(rsvp: SavedRsvp | null) {
  try {
    if (rsvp) localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: rsvp.id, token: rsvp.token }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the confirmation simply won't be remembered.
  }
}

export function RsvpForm({
  copy,
  confirmation,
  lang,
}: {
  copy: Dictionary["rsvp"];
  confirmation: Dictionary["confirmation"];
  lang: Locale;
}) {
  const [saved, setSaved] = useState<SavedRsvp | null>(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);

  // Arabic-Indic digits on the Arabic page
  const digits = new Intl.NumberFormat(lang === "ar" ? "ar-EG-u-nu-arab" : "en");

  // A guest who already replied on this device sees their confirmation.
  useEffect(() => {
    const stored = readStored();
    if (!stored) return;
    getMyRsvp(stored.id, stored.token)
      .then((rsvp) => {
        if (rsvp) setSaved(rsvp);
        else writeStored(null);
      })
      .catch(() => {});
  }, []);

  const [, formAction, pending] = useActionState(async (prev: RsvpState, formData: FormData) => {
    const result = await submitRsvp(prev, formData);
    if (result.status === "saved") {
      writeStored(result.rsvp);
      setSaved(result.rsvp);
      setEditing(false);
    } else if (result.status === "error") {
      toast.error(copy.errors[result.error]);
    }
    return result;
  }, { status: "idle" } satisfies RsvpState);

  function startEditing() {
    if (saved) {
      setName(saved.name);
      setPhone(saved.phone);
      setPartySize(Math.max(1, saved.partySize));
    }
    setEditing(true);
  }

  const card = "w-full max-w-md rounded-[2rem] border border-gold-soft bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(154,107,20,0.6)] md:p-8";

  if (saved && !editing) {
    const count =
      saved.partySize === 1
        ? confirmation.guestOne
        : fill(confirmation.guestMany, { n: digits.format(saved.partySize) });
    return (
      <section className={`${card} flex flex-col items-center gap-3 text-center animate-in fade-in-0 zoom-in-95 duration-300`}>
        <h1 className="font-serif text-3xl text-gold-deep">{fill(confirmation.title, { name: saved.name })}</h1>
        <p className="text-lg">{fill(confirmation.body, { count })}</p>
        <p className="text-xs text-muted-foreground rtl:text-sm">{confirmation.saved}</p>
        <Button variant="outline" className="mt-3 rounded-full border-gold-soft" onClick={startEditing}>
          <Pencil data-icon="inline-start" />
          {confirmation.change}
        </Button>
      </section>
    );
  }

  return (
    <section className={`${card} animate-in fade-in-0 duration-300`}>
      <h1 className="text-center font-serif text-3xl">{copy.title}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground rtl:text-base">{copy.subtitle}</p>

      <form action={formAction} className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="partySize" value={partySize} />
        {editing && saved ? (
          <>
            <input type="hidden" name="id" value={saved.id} />
            <input type="hidden" name="token" value={saved.token} />
          </>
        ) : null}
        <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rsvp-name">{copy.nameLabel}</Label>
          <Input
            id="rsvp-name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder={copy.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-white text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rsvp-phone">{copy.phoneLabel}</Label>
          {/* Any country: the field submits E.164, e.g. +201001234567 */}
          <PhoneInput
            id="rsvp-phone"
            name="phone"
            dir="ltr"
            locale={lang}
            defaultCountry={wedding.defaultPhoneCountry}
            searchPlaceholder={copy.phoneSearch}
            emptyText={copy.phoneEmpty}
            value={phone}
            onValueChange={setPhone}
            className="h-12 rounded-xl bg-white"
          >
            <PhoneInputCountrySelect />
            <PhoneInputField required placeholder={copy.phonePlaceholder} className="text-base" />
          </PhoneInput>
        </div>

        <div className="flex flex-col gap-2">
          <Label id="rsvp-party-label">{copy.partyLabel}</Label>
          <div
            role="group"
            aria-labelledby="rsvp-party-label"
            className="flex h-12 items-center justify-between rounded-xl border border-input bg-white px-1.5"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={copy.fewer}
              disabled={partySize <= 1}
              onClick={() => setPartySize((n) => Math.max(1, n - 1))}
            >
              <Minus />
            </Button>
            <output aria-live="polite" className="text-xl tabular-nums">
              {digits.format(partySize)}
            </output>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={copy.more}
              disabled={partySize >= wedding.maxPartySize}
              onClick={() => setPartySize((n) => Math.min(wedding.maxPartySize, n + 1))}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground rtl:text-sm">{copy.partyHint}</p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 rounded-full text-base shadow-[0_12px_30px_-10px_var(--primary)]"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" className="rtl:-scale-x-100" />
          )}
          {pending ? copy.sending : editing ? copy.update : copy.submit}
        </Button>
      </form>
    </section>
  );
}
