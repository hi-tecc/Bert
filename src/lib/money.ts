// Money is stored as integer cents throughout the app to avoid floating-point rounding.

const currencyFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

/** Format integer cents as a currency string, e.g. 123456 -> "€1,234.56". */
export function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** Convert a euro amount (number or numeric string) to integer cents. */
export function toCents(euros: number | string): number {
  const value = typeof euros === "string" ? Number(euros) : euros;
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

/** Convert integer cents to a euro number (for form inputs). */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}
