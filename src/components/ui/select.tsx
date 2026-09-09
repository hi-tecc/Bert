import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent px-0 text-sm text-[var(--color-foreground)] outline-none transition-colors duration-500 focus-visible:border-[var(--color-accent)] disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
