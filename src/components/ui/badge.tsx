import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--color-border)] text-[var(--color-muted)]",
  success: "border-[var(--color-success)]/40 text-[var(--color-success)]",
  warning: "border-[var(--color-warning)]/40 text-[var(--color-warning)]",
  danger: "border-[var(--color-danger)]/40 text-[var(--color-danger)]",
  info: "border-[var(--color-foreground)]/30 text-[var(--color-foreground)]",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
