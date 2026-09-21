"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { useI18n } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    {},
  );
  const { t } = useI18n();

  return (
    <Card>
      <CardContent>
        <h2 className="mb-1 text-lg font-semibold">{t.auth.forgotTitle}</h2>
        <p className="mb-4 text-sm text-slate-500">
          {t.auth.forgotSubtitle}
        </p>
        <form action={action} className="space-y-4">
          {state.success && (
            <p className="border border-[var(--color-success)]/30 px-3 py-2 text-sm text-[var(--color-success)]">
              {state.success} {t.auth.forgotConsoleHint}
            </p>
          )}
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <SubmitButton className="w-full">{t.auth.sendResetLink}</SubmitButton>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="text-[var(--color-primary)] hover:underline"
          >
            {t.auth.backToSignIn}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
