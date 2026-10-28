"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeartHandshake, Loader2, PartyPopper, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import { getMyRsvp, submitRsvp, type RsvpState, type SavedRsvp } from "@/app/actions";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { FireworksBackground } from "@/components/ui/fireworks-show";
import { GuestSelector } from "@/components/ui/guest-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput, PhoneInputCountrySelect, PhoneInputField } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Reveal from "@/components/ui/reveal";
import { Textarea } from "@/components/ui/textarea";
import { GOLD_FIREWORKS } from "@/components/wedding/countdown-section";
import { brideImage, groomImage, partyImages } from "@/components/wedding/guest-images";
import { fill, type Dictionary } from "@/lib/dictionaries";
import { wedding, type Locale } from "@/lib/wedding-config";

const STORAGE_KEY = "az-wedding-rsvp";
const CONFETTI_COLORS = ["#ffc23d", "#ffe7a3", "#9a6b14", "#ffffff", "#f4e7c8"];

type Attending = "" | "yes" | "no";

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

export function RsvpSection({
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
  const [fireworks, setFireworks] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);

  const [name, setName] = useState("");
  const [attending, setAttending] = useState<Attending>("");
  const [partySize, setPartySize] = useState(1);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    if (!fireworks) return;
    const id = setTimeout(() => setFireworks(false), 7000);
    return () => clearTimeout(id);
  }, [fireworks]);

  function celebrate() {
    const fire = (x: number, angle: number) =>
      confettiRef.current?.fire({
        particleCount: 120,
        spread: 75,
        angle,
        startVelocity: 55,
        origin: { x, y: 0.75 },
        colors: CONFETTI_COLORS,
        shapes: ["circle", "square", "star"],
        scalar: 1.1,
      });
    fire(0.15, 60);
    fire(0.85, 120);
    setTimeout(() => fire(0.5, 90), 350);
    setTimeout(() => {
      fire(0.25, 70);
      fire(0.75, 110);
    }, 900);
    setFireworks(true);
  }

  const [, formAction, pending] = useActionState(async (prev: RsvpState, formData: FormData) => {
    const result = await submitRsvp(prev, formData);
    if (result.status === "saved") {
      writeStored(result.rsvp);
      setSaved(result.rsvp);
      setEditing(false);
      if (result.rsvp.attending) celebrate();
      document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (result.status === "error") {
      toast.error(copy.errors[result.error]);
    }
    return result;
  }, { status: "idle" } satisfies RsvpState);

  function startEditing() {
    if (saved) {
      setName(saved.name);
      setAttending(saved.attending ? "yes" : "no");
      setPartySize(Math.max(1, saved.partySize));
      setPhone(saved.phone);
      setMessage(saved.message);
    }
    setEditing(true);
  }

  const showConfirmation = saved && !editing;
  const guestCount = saved
    ? saved.partySize === 1
      ? confirmation.guestOne
      : fill(confirmation.guestMany, { n: saved.partySize })
    : "";

  return (
    <section id="rsvp" className="relative isolate overflow-hidden px-4 py-20 md:py-28">
      <FallingPattern
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_25%,#000_80%)]"
        color="var(--primary)"
        backgroundColor="var(--background)"
        duration={120}
      />

      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none fixed inset-0 z-[60] size-full"
      />
      {fireworks ? (
        <div className="pointer-events-none fixed inset-0 z-[55]">
          <FireworksBackground colors={GOLD_FIREWORKS} />
        </div>
      ) : null}

      <Reveal className="mb-12 text-center">
        <h2 className="font-serif text-4xl md:text-6xl">{copy.title}</h2>
        <p className="mt-4 text-muted-foreground">{copy.subtitle}</p>
      </Reveal>

      <Reveal index={1} className="mx-auto max-w-xl">
        <BorderBeam
          color="#d9a52a"
          length={16}
          thickness={2}
          speed={8}
          className="rounded-[2rem] border border-gold-soft bg-background/95 p-6 shadow-[0_30px_80px_-40px_rgba(154,107,20,0.6)] md:p-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {showConfirmation ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="flex items-end">
                  <motion.img
                    src={groomImage}
                    alt=""
                    className="size-20 md:size-24"
                    initial={{ x: -30, rotate: -10, opacity: 0 }}
                    animate={{ x: 6, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.15 }}
                  />
                  <motion.span
                    className="mb-6 text-primary"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    {saved.attending ? <PartyPopper className="size-7" /> : <HeartHandshake className="size-7" />}
                  </motion.span>
                  <motion.img
                    src={brideImage}
                    alt=""
                    className="size-20 md:size-24"
                    initial={{ x: 30, rotate: 10, opacity: 0 }}
                    animate={{ x: -6, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.25 }}
                  />
                </div>
                <h3 className="font-serif text-3xl text-gold-deep md:text-4xl">
                  {fill(saved.attending ? confirmation.yesTitle : confirmation.noTitle, { name: saved.name })}
                </h3>
                <p className="text-lg">
                  {saved.attending ? fill(confirmation.yesBody, { count: guestCount }) : confirmation.noBody}
                </p>
                <p className="text-xs text-muted-foreground">{confirmation.saved}</p>
                <Button variant="outline" className="mt-2 rounded-full border-gold-soft" onClick={startEditing}>
                  <Pencil data-icon="inline-start" />
                  {confirmation.change}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                action={formAction}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="flex flex-col gap-6"
              >
                <input type="hidden" name="locale" value={lang} />
                <input type="hidden" name="attending" value={attending} />
                <input type="hidden" name="partySize" value={attending === "yes" ? partySize : 0} />
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
                    className="h-11 rounded-xl bg-white/70 text-base"
                  />
                </div>

                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-3 text-sm font-medium">{copy.attendingLabel}</legend>
                  <RadioGroup
                    value={attending}
                    onValueChange={(v) => setAttending(v as Attending)}
                    className="grid-cols-1 sm:grid-cols-2"
                  >
                    {(
                      [
                        { value: "yes", title: copy.yes, hint: copy.yesHint, icon: PartyPopper },
                        { value: "no", title: copy.no, hint: copy.noHint, icon: HeartHandshake },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.value}
                        htmlFor={`attending-${option.value}`}
                        className="relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-input bg-white/60 p-4 shadow-sm shadow-black/5 transition-all outline-ring/70 has-[[data-state=checked]]:-translate-y-0.5 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-champagne/60 has-[[data-state=checked]]:shadow-[0_10px_30px_-12px_var(--primary)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <RadioGroupItem
                            id={`attending-${option.value}`}
                            value={option.value}
                            className="order-1 after:absolute after:inset-0"
                          />
                          <option.icon className="size-6 text-gold-deep" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-serif text-lg">{option.title}</p>
                          <p className="text-sm text-muted-foreground">{option.hint}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>

                <AnimatePresence initial={false}>
                  {attending === "yes" ? (
                    <motion.div
                      key="party"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <GuestSelector
                        title={copy.partyTitle}
                        description={copy.partyDescription}
                        emptyLabel={copy.partyEmpty}
                        imageSources={partyImages}
                        maxGuests={wedding.maxPartySize}
                        initialValue={partySize}
                        onValueChange={setPartySize}
                        className="max-w-none rounded-2xl border border-gold-soft/70 bg-white/50"
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

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
                    className="h-11 rounded-xl bg-white/70"
                  >
                    <PhoneInputCountrySelect />
                    <PhoneInputField placeholder={copy.phonePlaceholder} className="text-base" />
                  </PhoneInput>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="rsvp-message">{copy.messageLabel}</Label>
                  <Textarea
                    id="rsvp-message"
                    name="message"
                    maxLength={500}
                    rows={3}
                    placeholder={copy.messagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl bg-white/70 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="h-12 rounded-full text-base shadow-[0_12px_30px_-10px_var(--primary)] transition-transform hover:-translate-y-0.5"
                >
                  {pending ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Send data-icon="inline-start" className="rtl:-scale-x-100" />
                  )}
                  {pending ? copy.sending : editing ? copy.update : copy.submit}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </BorderBeam>
      </Reveal>
    </section>
  );
}
