import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
  secondary:
    "border border-[var(--color-foreground)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]",
  outline:
    "border border-[var(--color-border)] bg-transparent hover:border-[var(--color-foreground)]",
  ghost: "hover:bg-[var(--color-muted-bg)]",
  danger:
    "border border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[11px]",
  md: "h-11 px-7 text-xs",
  icon: "h-10 w-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-none font-medium uppercase tracking-[0.2em] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-foreground)]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {variant === "primary" && (
        // Gold layer slides in from the left on hover — the signature reward.
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-[var(--color-accent)] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0"
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  ),
);
Button.displayName = "Button";
