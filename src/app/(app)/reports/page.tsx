import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { requireUser, isShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { buildReport } from "@/lib/reports";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import {
  ReportFilters,
  type EmployeeOption,
} from "@/components/reports/report-filters";
import { getT } from "@/lib/i18n/server";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    companyId?: string;
    employeeId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const user = await requireUser();
  const t = await getT();
  const sp = await searchParams;
  const shopAdmin = isShopAdmin(user);

  const companies = shopAdmin
    ? await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const employees = await prisma.employee.findMany({
    where: shopAdmin ? {} : { companyId: user.companyId ?? "__none__" },
    include: { company: { select: { name: true } } },
    orderBy: [{ company: { name: "asc" } }, { lastName: "asc" }],
  });
  const employeeOptions: EmployeeOption[] = employees.map((e) => ({
    id: e.id,
    label: shopAdmin
      ? `${e.company.name} — ${e.firstName} ${e.lastName}`
      : `${e.firstName} ${e.lastName}`,
    companyId: e.companyId,
  }));

  const report = await buildReport(user, {
    companyId: sp.companyId,
    employeeId: sp.employeeId,
    from: sp.from ? new Date(sp.from) : undefined,
    to: sp.to ? new Date(sp.to) : undefined,
  }, {
    spendingReport: t.reports.spendingReport,
    allCompanies: t.reports.allCompanies,
    companyFallback: t.reports.companyFallback,
  });

  const exportQuery = new URLSearchParams();
  if (sp.companyId) exportQuery.set("companyId", sp.companyId);
  if (sp.employeeId) exportQuery.set("employeeId", sp.employeeId);
  if (sp.from) exportQuery.set("from", sp.from);
  if (sp.to) exportQuery.set("to", sp.to);
  const qs = exportQuery.toString();
  const exportUrl = (fmt: string) =>
    `/api/reports/export?format=${fmt}${qs ? `&${qs}` : ""}`;

  return (
    <div>
      <PageHeader
        title={t.reports.title}
        subtitle={t.reports.subtitle}
      />

      <Card className="mb-6">
        <CardContent>
          <ReportFilters
            companies={companies}
            employees={employeeOptions}
            showCompany={shopAdmin}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{report.title}</CardTitle>
            <p className="text-sm text-slate-500">
              {report.rangeLabel} · {report.count} {t.reports.purchasesWord} ·{" "}
              <span className="font-medium text-[var(--color-foreground)]">
                {formatMoney(report.total)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={exportUrl("csv")}
              className="inline-flex h-11 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <FileText className="h-4 w-4" /> CSV
            </a>
            <a
              href={exportUrl("xlsx")}
              className="inline-flex h-11 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </a>
            <a
              href={exportUrl("pdf")}
              className="inline-flex h-11 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <FileDown className="h-4 w-4" /> PDF
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {report.rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {t.reports.noMatch}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>{t.common.date}</TH>
                      <TH>{t.common.company}</TH>
                      <TH>{t.common.employee}</TH>
                      <TH>{t.common.description}</TH>
                      <TH className="text-right">{t.common.amount}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {report.rows.map((r, i) => (
                      <TR key={i}>
                        <TD className="whitespace-nowrap text-slate-500">
                          {formatDate(r.date)}
                        </TD>
                        <TD className="text-slate-600">{r.company}</TD>
                        <TD className="text-slate-600">{r.employee}</TD>
                        <TD className="font-medium">{r.description}</TD>
                        <TD className="text-right font-medium">
                          {formatMoney(r.amount)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {report.rows.map((r, i) => (
                  <MobileCard key={i}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="font-medium">{r.description}</span>
                      <span className="font-medium">{formatMoney(r.amount)}</span>
                    </div>
                    <MobileCardRow label={t.common.date}>
                      {formatDate(r.date)}
                    </MobileCardRow>
                    <MobileCardRow label={t.common.company}>{r.company}</MobileCardRow>
                    <MobileCardRow label={t.common.employee}>{r.employee}</MobileCardRow>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
