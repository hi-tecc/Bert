"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useId, useState, useRef, useEffect } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { setLocaleAction } from "@/lib/actions/locale";

export function LanguagePicker() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, LOCALES.indexOf(locale)),
  );
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = `${useId()}-language-listbox`;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => optionRefs.current[activeIndex]?.focus());
    }
  }, [activeIndex, open]);

  function select(next: string) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  function closeAndRestoreFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAndRestoreFocus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, LOCALES.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(LOCALES.length - 1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setActiveIndex(Math.max(0, LOCALES.indexOf(locale)));
          setOpen((value) => !value);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(
              e.key === "ArrowUp" ? LOCALES.length - 1 : Math.max(0, LOCALES.indexOf(locale)),
            );
            setOpen(true);
          }
        }}
        aria-label={t.language.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={isPending}
        className="flex h-11 items-center gap-1.5 rounded-none px-2 text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50"
      >
        <Languages className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-xs font-medium uppercase tracking-[0.15em]">{locale}</span>
        <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t.language.label}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-20 mt-1 w-44 border border-[var(--color-border)] bg-[var(--color-surface)] py-1 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          {LOCALES.map((l, index) => (
            <li key={l}>
              <button
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="option"
                aria-selected={l === locale}
                tabIndex={index === activeIndex ? 0 : -1}
                onFocus={() => setActiveIndex(index)}
                onClick={() => select(l)}
                className="flex min-h-11 w-full items-center justify-between px-3 py-2 text-left transition-colors duration-200 hover:bg-[var(--color-muted-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
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
