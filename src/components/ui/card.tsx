import * as React from "react";
import { cn } from "@/lib/utils";
import { emphasizeLastWord } from "./emphasize";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardTitle({
  className,
  emphasizeLast = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { emphasizeLast?: boolean }) {
  return (
    <h3
      className={cn(
        "font-serif text-lg text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    >
      {emphasizeLast && typeof children === "string"
        ? emphasizeLastWord(children)
        : children}
    </h3>
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
