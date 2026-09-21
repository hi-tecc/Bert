"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/form-error";
import { useI18n } from "@/lib/i18n/context";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    {},
  );
  const { t } = useI18n();

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-lg font-semibold">{t.auth.resetTitle}</h2>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <FormError message={state.error} />
          {state.success && (
            <p
              role="status"
              aria-live="polite"
              className="border border-[var(--color-success)]/30 px-3 py-2 text-sm text-[var(--color-success)]"
            >
              {state.success}
            </p>
          )}
          <div>
            <Label htmlFor="password">{t.auth.newPassword}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm">{t.auth.confirmPassword}</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <SubmitButton className="w-full">{t.auth.updatePassword}</SubmitButton>
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
