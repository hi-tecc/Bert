"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

/** URL-synced search + optional status filter for list pages. */
export function ListToolbar({
  placeholder = "Search...",
  withStatusFilter = true,
}: {
  placeholder?: string;
  withStatusFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "all";

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      if (next.toString() !== params.toString()) {
        router.replace(`${pathname}?${next.toString()}`);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setStatus(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("status");
    else next.set("status", value);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-64 sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm outline-none focus-visible:border-[var(--color-primary)]"
        />
      </div>
      {withStatusFilter && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus-visible:border-[var(--color-primary)] sm:w-auto"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}
    </div>
  );
}
