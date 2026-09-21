import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/lib/i18n/server";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    const t = await getT();
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-600">
            {t.auth.missingTokenPrefix}
            <Link
              href="/forgot-password"
              className="text-[var(--color-primary)] hover:underline"
            >
              {t.auth.missingTokenLink}
            </Link>
            {t.auth.missingTokenSuffix}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}
