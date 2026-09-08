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
      <CardContent>
        <form action={action} className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
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
              required
            />
          </div>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-[var(--color-primary)] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Demo accounts</p>
          <p>Shop admin: admin@shop.test / admin123</p>
          <p>Company admin: acme@company.test / company123</p>
        </div>
      </CardContent>
    </Card>
  );
}
