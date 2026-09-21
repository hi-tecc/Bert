"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/form-error";
import { useI18n } from "@/lib/i18n/context";

export default function LoginPage() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  const { t } = useI18n();

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl tracking-tight">
            {t.auth.welcome}{" "}
            <span className="italic text-[var(--color-accent)]">{t.auth.welcomeAccent}</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t.auth.signInSubtitle}
          </p>
        </div>
        <form action={action} className="space-y-6">
          <FormError message={state.error} />
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t.auth.emailPlaceholder}
              spellCheck={false}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t.auth.passwordPlaceholder}
              required
            />
          </div>
          <SubmitButton className="w-full">{t.auth.signIn}</SubmitButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>

        {(process.env.NODE_ENV !== "production" ||
          process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true") && (
          <div className="mt-8 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)]">
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[var(--color-foreground)]">
              {t.auth.demoAccounts}
            </p>
            <p>{t.auth.demoShop}</p>
            <p>{t.auth.demoCompany}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
