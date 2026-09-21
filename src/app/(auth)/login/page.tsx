"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
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
          {state.error && (
            <p className="animate-fade-in border border-[var(--color-danger)]/30 px-3 py-2 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
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
            className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors duration-500 hover:text-[var(--color-accent)]"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)]">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-foreground)]">
            {t.auth.demoAccounts}
          </p>
          <p>{t.auth.demoShop}</p>
          <p>{t.auth.demoCompany}</p>
        </div>
      </CardContent>
    </Card>
  );
}
