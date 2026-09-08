import type { z } from "zod";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

/** Flatten a Zod error into a field -> message map. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
