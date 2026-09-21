"use client";

import { Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/** Submit button that confirms before firing a destructive server action. */
export function DeleteButton({
  id,
  action,
  label,
  confirmMessage,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t.common.delete;
  const resolvedConfirm = confirmMessage ?? t.common.confirmDeleteDefault;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(resolvedConfirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--color-danger)]/40 px-4 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-danger)] transition-colors duration-500 hover:bg-[var(--color-danger)] hover:text-white"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        {resolvedLabel}
      </button>
    </form>
  );
}
