import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": errorId,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {error && (
        <p
          id={errorId}
          aria-live="polite"
          className="mt-1 text-xs text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
