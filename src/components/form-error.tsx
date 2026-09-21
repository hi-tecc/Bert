"use client";

import { useEffect, useRef } from "react";

export function FormError({ message }: { message?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  if (!message) return null;

  return (
    <p
      ref={ref}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className="animate-fade-in border border-[var(--color-danger)]/30 px-3 py-2 text-sm text-[var(--color-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]"
    >
      {message}
    </p>
  );
}

export function useFocusFirstError(errors: Record<string, string | undefined>) {
  const firstError = Object.keys(errors).find((key) => errors[key]);

  useEffect(() => {
    if (firstError) document.getElementById(firstError)?.focus();
  }, [firstError]);
}
