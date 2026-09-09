"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { ROLES, type Role } from "@/lib/constants";
import { MobileNav } from "./mobile-nav";

export function Topbar({
  name,
  role,
}: {
  name?: string | null;
  role: Role;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const roleLabel = role === ROLES.SHOP_ADMIN ? "Shop admin" : "Company admin";

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2">
        <MobileNav role={role} />
        <form onSubmit={onSearch} className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, employees, purchases…"
            className="h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent pl-7 pr-4 text-sm outline-none transition-colors duration-500 placeholder:font-serif placeholder:italic placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)]"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/search"
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-500 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)] md:hidden"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{name}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">{roleLabel}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-500 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </header>
  );
}
