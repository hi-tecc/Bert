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
    <header className="flex h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2">
        <MobileNav role={role} />
        <form onSubmit={onSearch} className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, employees, purchases..."
            className="h-10 w-full rounded-full border border-[var(--color-border)] bg-slate-50 pl-9 pr-4 text-sm outline-none focus-visible:border-[var(--color-primary)] focus-visible:bg-white"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/search"
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Search className="h-4 w-4" />
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{name}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
