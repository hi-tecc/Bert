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
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] md:block">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-foreground)] font-serif text-lg text-[var(--color-primary-foreground)]">
          B
        </div>
        <span className="font-serif text-lg tracking-tight">Budget Tracker</span>
      </div>
      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-none border-l-2 px-3 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-500",
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-muted-bg)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
