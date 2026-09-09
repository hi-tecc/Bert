import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent px-0 py-2 text-sm text-[var(--color-foreground)] outline-none transition-colors duration-500 placeholder:font-serif placeholder:italic placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)] disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
