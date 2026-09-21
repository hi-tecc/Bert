"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "./button";
import { useI18n } from "@/lib/i18n/context";

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          {t.common.saving}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
