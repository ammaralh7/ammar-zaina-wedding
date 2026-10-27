"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { login, type LoginState } from "@/app/[lang]/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/dictionaries";

export function LoginForm({ copy }: { copy: Dictionary["admin"] }) {
  const [state, action, pending] = useActionState(login, { error: null } satisfies LoginState);

  return (
    <form action={action} className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-gold-soft bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(154,107,20,0.6)]">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-champagne text-gold-deep">
        <LockKeyhole className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">{copy.passwordLabel}</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-xl"
          aria-invalid={state.error ? true : undefined}
        />
        {state.error ? <p className="text-sm text-destructive">{copy.wrongPassword}</p> : null}
      </div>
      <Button type="submit" size="lg" className="h-11 rounded-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
        {copy.login}
      </Button>
    </form>
  );
}
