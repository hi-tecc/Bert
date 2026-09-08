"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItemsForRole, isNavItemActive } from "./nav-items";
import type { Role } from "@/lib/constants";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItemsForRole(role);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--color-border)] bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-bold text-white">
          B
        </div>
        <span className="font-semibold">Budget Tracker</span>
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-[var(--color-primary)]"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
