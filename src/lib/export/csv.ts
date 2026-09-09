import { format } from "date-fns";
import { fromCents } from "../money";
import type { ReportResult } from "../reports";

function esc(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function reportToCsv(report: ReportResult): string {
  const lines: string[] = [];
  lines.push(esc(report.title));
  lines.push(esc(`Period: ${report.rangeLabel}`));
  lines.push("");
  lines.push(["Date", "Company", "Employee", "Description", "Notes", "Amount (EUR)"].map(esc).join(","));

  for (const r of report.rows) {
    lines.push(
      [
        format(r.date, "yyyy-MM-dd"),
        r.company,
        r.employee,
        r.description,
        r.notes ?? "",
        fromCents(r.amount).toFixed(2),
      ]
        .map((v) => esc(String(v)))
        .join(","),
    );
  }

  lines.push("");
  lines.push([esc("Total"), "", "", "", "", esc(fromCents(report.total).toFixed(2))].join(","));
  return lines.join("\r\n");
}
