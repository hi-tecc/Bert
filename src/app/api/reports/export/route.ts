import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { buildReport, type ReportParams } from "@/lib/reports";
import { reportToCsv } from "@/lib/export/csv";
import { reportToExcel } from "@/lib/export/excel";
import { reportToPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const sp = request.nextUrl.searchParams;
  const format = (sp.get("format") ?? "csv").toLowerCase();

  const params: ReportParams = {
    companyId: sp.get("companyId") ?? undefined,
    employeeId: sp.get("employeeId") ?? undefined,
    from: parseDate(sp.get("from")),
    to: parseDate(sp.get("to")),
  };

  const report = await buildReport(user, params);
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    return new NextResponse(reportToCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="report-${stamp}.csv"`,
      },
    });
  }

  if (format === "xlsx" || format === "excel") {
    const buffer = await reportToExcel(report);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="report-${stamp}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await reportToPdf(report);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${stamp}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
