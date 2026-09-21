const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Date shown in Belgian locale, e.g. 21/09/2026. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** Date + time shown in Belgian locale, e.g. 21/09/2026 14:30. */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}
