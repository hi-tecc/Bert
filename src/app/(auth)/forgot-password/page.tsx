"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    {},
  );

  return (
    <Card>
      <CardContent>
        <h2 className="mb-1 text-lg font-semibold">Reset your password</h2>
        <p className="mb-4 text-sm text-slate-500">
          Enter your email and we&apos;ll generate a reset link.
        </p>
        <form action={action} className="space-y-4">
          {state.success && (
            <p className="border border-[var(--color-success)]/30 px-3 py-2 text-sm text-[var(--color-success)]">
              {state.success} (Check the server console for the link in local
              development.)
            </p>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <SubmitButton className="w-full">Send reset link</SubmitButton>
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
