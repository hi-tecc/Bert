"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-lg font-semibold">Choose a new password</h2>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          {state.error && (
            <p className="border border-[var(--color-danger)]/30 px-3 py-2 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="border border-[var(--color-success)]/30 px-3 py-2 text-sm text-[var(--color-success)]">
              {state.success}
            </p>
          )}
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <SubmitButton className="w-full">Update password</SubmitButton>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="text-[var(--color-primary)] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
