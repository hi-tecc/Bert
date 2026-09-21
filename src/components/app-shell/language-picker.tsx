"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { setLocaleAction } from "@/lib/actions/locale";

export function LanguagePicker() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(next: string) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.language.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isPending}
        className="flex h-9 items-center gap-1.5 rounded-none px-2 text-[var(--color-muted)] transition-colors duration-500 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)] disabled:opacity-50"
      >
        <Languages className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-xs font-medium uppercase tracking-[0.15em]">{locale}</span>
        <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 w-44 border border-[var(--color-border)] bg-[var(--color-surface)] py-1 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => select(l)}
                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors duration-500 hover:bg-[var(--color-muted-bg)]"
              >
                <span>{LOCALE_LABELS[l]}</span>
                {l === locale && (
                  <Check className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.5} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
