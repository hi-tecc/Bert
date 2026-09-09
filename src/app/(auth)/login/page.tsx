"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl tracking-tight">
            Welcome <span className="italic text-[var(--color-accent)]">back</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Sign in to continue to your account.
          </p>
        </div>
        <form action={action} className="space-y-6">
          {state.error && (
            <p className="animate-fade-in border border-[var(--color-danger)]/30 px-3 py-2 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors duration-500 hover:text-[var(--color-accent)]"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)]">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-foreground)]">
            Demo accounts
          </p>
          <p>Shop admin: admin@shop.test / admin123</p>
          <p>Company admin: acme@company.test / company123</p>
        </div>
      </CardContent>
    </Card>
  );
}
