import ExcelJS from "exceljs";
import { format } from "date-fns";
import { fromCents } from "../money";
import { BUDGET_LEVEL_LABEL } from "../budget";
import type { ReportResult } from "../reports";

export async function reportToExcel(report: ReportResult): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Budget Tracker";
  wb.created = report.generatedAt;

  const ws = wb.addWorksheet("Purchases");
  ws.mergeCells("A1:F1");
  ws.getCell("A1").value = report.title;
  ws.getCell("A1").font = { size: 14, bold: true };
  ws.getCell("A2").value = `Period: ${report.rangeLabel}`;
  ws.addRow([]);

  const header = ws.addRow([
    "Date",
    "Company",
    "Employee",
    "Description",
    "Notes",
    "Amount (USD)",
  ]);
  header.font = { bold: true };
  header.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEF2FF" },
    };
  });

  for (const r of report.rows) {
    ws.addRow([
      format(r.date, "yyyy-MM-dd"),
      r.company,
      r.employee,
      r.description,
      r.notes ?? "",
      fromCents(r.amount),
    ]);
  }

  const totalRow = ws.addRow(["Total", "", "", "", "", fromCents(report.total)]);
  totalRow.font = { bold: true };

  ws.getColumn(6).numFmt = '"$"#,##0.00';
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      max = Math.max(max, String(cell.value ?? "").length + 2);
    });
    col.width = Math.min(max, 45);
  });

  // Budget summary sheet
  const summary = wb.addWorksheet("Budget summary");
  const sHeader = summary.addRow([
    "Employee",
    "Company",
    "Budget (USD)",
    "Spent (USD)",
    "Remaining (USD)",
    "Used %",
    "Status",
  ]);
  sHeader.font = { bold: true };
  for (const s of report.employeeSummaries) {
    summary.addRow([
      s.employee,
      s.company,
      fromCents(s.status.budget),
      fromCents(s.status.spent),
      fromCents(s.status.remaining),
      s.status.percent / 100,
      BUDGET_LEVEL_LABEL[s.status.level],
    ]);
  }
  summary.getColumn(3).numFmt = '"$"#,##0.00';
  summary.getColumn(4).numFmt = '"$"#,##0.00';
  summary.getColumn(5).numFmt = '"$"#,##0.00';
  summary.getColumn(6).numFmt = "0.0%";
  summary.columns.forEach((col) => {
    col.width = 18;
  });

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
