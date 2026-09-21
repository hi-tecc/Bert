"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  id: string;
  label: string;
}

export function Combobox({
  id,
  name,
  options,
  value,
  onChange,
  placeholder = "Search…",
  emptyMessage = "No matches",
  required,
  disabled,
  className,
}: {
  id?: string;
  name?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);

  const selected = options.find((o) => o.id === value);

  // Keep the visible text in sync with the selected option when not actively editing.
  React.useEffect(() => {
    if (!open) {
      setQuery(selected ? selected.label : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, open]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected ? selected.label : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || query === selected?.label) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, selected]);

  function selectOption(option: ComboboxOption) {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlighted];
      if (option) selectOption(option);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(selected ? selected.label : "");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent px-0 text-sm text-[var(--color-foreground)] outline-none transition-colors duration-500 placeholder:font-serif placeholder:italic placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)] disabled:opacity-50",
          className,
        )}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          if (!open) setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto border border-[var(--color-foreground)]/20 bg-[var(--color-background)] text-sm shadow-md">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-[var(--color-muted)]">{emptyMessage}</li>
          )}
          {filtered.map((option, index) => (
            <li key={option.id}>
              <button
                type="button"
                className={cn(
                  "block w-full px-3 py-2 text-left hover:bg-[var(--color-foreground)]/5",
                  index === highlighted && "bg-[var(--color-foreground)]/5",
                  option.id === value && "font-medium",
                )}
                onMouseEnter={() => setHighlighted(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
