import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-600">
            Missing reset token. Please request a new{" "}
            <Link
              href="/forgot-password"
              className="text-[var(--color-primary)] hover:underline"
            >
              password reset
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}
