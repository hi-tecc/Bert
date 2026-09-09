import * as React from "react";
import { cn } from "@/lib/utils";

/** Container for the mobile card list shown in place of a table on small screens. */
export function MobileCards({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3 p-4 md:hidden", className)} {...props} />
  );
}

export function MobileCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className,
      )}
      {...props}
    />
  );
}

export function MobileCardRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 text-sm", className)}
    >
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--color-foreground)]">{children}</span>
    </div>
  );
}
