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
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
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
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const generatedId = React.useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);

  const selected = options.find((o) => o.id === value);

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
  const safeHighlighted = Math.min(highlighted, Math.max(0, filtered.length - 1));
  const activeOption = filtered[safeHighlighted];

  function selectOption(option: ComboboxOption) {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setQuery(selected?.label ?? "");
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(Math.min(safeHighlighted + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(Math.max(safeHighlighted - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlighted(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlighted(Math.max(0, filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[safeHighlighted];
      if (option) selectOption(option);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(selected ? selected.label : "");
    } else if (e.key === "Tab") {
      setOpen(false);
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
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeOption ? `${listboxId}-${activeOption.id}` : undefined
        }
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={required}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-none border-0 border-b border-[var(--color-foreground)]/30 bg-transparent px-0 text-sm text-[var(--color-foreground)] outline-none transition-colors duration-200 placeholder:font-serif placeholder:italic placeholder:text-[var(--color-muted)] focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:opacity-50",
          className,
        )}
        value={open ? query : selected?.label ?? ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          if (!open) setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => {
          setQuery(selected?.label ?? "");
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto overscroll-contain border border-[var(--color-foreground)]/20 bg-[var(--color-background)] text-sm shadow-md"
        >
          {filtered.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-[var(--color-muted)]">
              {emptyMessage}
            </li>
          )}
          {filtered.map((option, index) => (
            <li
              id={`${listboxId}-${option.id}`}
              key={option.id}
              role="option"
              aria-selected={option.id === value}
              className={cn(
                "min-h-11 cursor-pointer px-3 py-2.5 hover:bg-[var(--color-foreground)]/5",
                index === safeHighlighted && "bg-[var(--color-foreground)]/5",
                option.id === value && "font-medium",
              )}
              onMouseEnter={() => setHighlighted(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
