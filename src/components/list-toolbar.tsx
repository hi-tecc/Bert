"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/** URL-synced search + optional status filter for list pages. */
export function ListToolbar({
  placeholder = "Search...",
  withStatusFilter = true,
  sortOptions,
}: {
  placeholder?: string;
  withStatusFilter?: boolean;
  sortOptions?: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t } = useI18n();

  const [q, setQ] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "all";
  const requestedSort = params.get("sort");
  const sort =
    sortOptions?.find((option) => option.value === requestedSort)?.value ??
    sortOptions?.[0]?.value ??
    "";

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      next.delete("page");
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
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  }

  function setSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === sortOptions?.[0]?.value) next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-64 sm:flex-1">
        <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={1.5} />
        <input
          name="q"
          type="search"
          autoComplete="off"
          aria-label={t.topbar.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent pl-7 pr-3 text-sm outline-none transition-colors duration-200 placeholder:font-serif placeholder:italic placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
        />
      </div>
      {withStatusFilter && (
        <select
          name="status"
          aria-label={t.common.status}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-[var(--color-background)] px-0 text-sm outline-none transition-colors duration-200 focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] sm:w-auto"
        >
          <option value="all">{t.common.allStatuses}</option>
          <option value="active">{t.common.active}</option>
          <option value="inactive">{t.common.inactive}</option>
        </select>
      )}
      {sortOptions && (
        <select
          name="sort"
          aria-label={t.common.sortBy}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-[var(--color-background)] px-0 text-sm outline-none transition-colors duration-200 focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] sm:w-auto"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
