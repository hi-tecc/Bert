"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItemsForRole, isNavItemActive } from "./nav-items";
import type { Role } from "@/lib/constants";

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navItemsForRole(role);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-500 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)]"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-[var(--color-foreground)]/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-[var(--color-surface)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-foreground)] font-serif text-lg text-[var(--color-primary-foreground)]">
                  B
                </div>
                <span className="font-serif text-lg tracking-tight">Budget Tracker</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-500 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
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
        </div>
      )}
    </div>
  );
}
