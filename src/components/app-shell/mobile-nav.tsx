"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItemsForRole, isNavItemActive } from "./nav-items";
import type { Role } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const items = navItemsForRole(role);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeRef.current?.focus());
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (open) triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.topbar.openMenu}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="flex h-11 w-11 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.topbar.closeMenu}
            className="absolute inset-0 bg-[var(--color-foreground)]/40"
            onClick={() => setOpen(false)}
          />
          <aside
            id="mobile-navigation"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.topbar.navigationMenu}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overscroll-contain bg-[var(--color-surface)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[var(--color-foreground)] font-serif text-lg text-[var(--color-primary-foreground)]">
                  B
                </div>
                <span className="font-serif text-lg tracking-tight">{t.common.appName}</span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.topbar.closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-none text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
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
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-none border-l-2 px-3 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-muted-bg)] text-[var(--color-foreground)]"
                        : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    {t.nav[item.labelKey]}
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
