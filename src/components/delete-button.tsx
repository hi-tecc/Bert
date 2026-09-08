"use client";

import { Trash2 } from "lucide-react";

/** Submit button that confirms before firing a destructive server action. */
export function DeleteButton({
  id,
  action,
  label = "Delete",
  confirmMessage = "Are you sure? This cannot be undone.",
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
