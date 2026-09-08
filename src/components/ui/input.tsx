import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
