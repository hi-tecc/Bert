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
        "rounded-[var(--radius)] border border-[var(--color-border)] p-4",
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
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  );
}
