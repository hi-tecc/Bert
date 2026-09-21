import { Users, Euro, Wallet, PiggyBank } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear, yearRange } from "@/lib/budget";
import {
  BUDGET_CRITICAL_THRESHOLD,
  BUDGET_WARN_THRESHOLD,
} from "@/lib/constants";
import { getEmployeesWithBudget } from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { BudgetBar } from "@/components/ui/budget-bar";
import { BudgetStatusBadge } from "@/components/budget-status-badge";
import {
  RecentPurchases,
  type RecentPurchaseRow,
} from "@/components/dashboard/recent-purchases";
import { getT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/config";

export async function CompanyDashboard({ companyId }: { companyId: string }) {
  const t = await getT();
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  const year = currentYear();
  const { start, end } = yearRange(year);

  const [employees, recent] = await Promise.all([
    getEmployeesWithBudget({ companyId }, year),
    prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { employee: { companyId } },
      include: { employee: true },
    }),
  ]);

  const totalBudget = employees.reduce((s, e) => s + e.annualBudget, 0);
  const totalSpent = employees.reduce((s, e) => s + e.status.spent, 0);
  const summary = budgetStatus(totalSpent, totalBudget);

  const recentRows: RecentPurchaseRow[] = recent.map((p) => ({
    id: p.id,
    date: p.date,
    amount: p.amount,
    description: p.description,
    employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
  }));

  void start;
  void end;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{company.name}</h1>
        <p className="mt-1.5 text-sm text-[var(--color-muted)]">{interpolate(t.dashboard.companyOverview, { year })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.common.employees} value={String(employees.length)} icon={Users} />
        <StatCard
          label={t.common.annualBudget}
          value={formatMoney(totalBudget)}
          icon={Wallet}
        />
        <StatCard
          label={t.common.spent}
          value={formatMoney(totalSpent)}
          hint={interpolate(t.common.percentOfBudget, { value: summary.percent })}
          icon={Euro}
        />
        <StatCard
          label={t.common.remaining}
          value={formatMoney(summary.remaining)}
          icon={PiggyBank}
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle emphasizeLast>{t.dashboard.employeeBudgets}</CardTitle>
          <BudgetStatusBadge level={summary.level} percent={summary.percent} />
        </CardHeader>
        <CardContent className="pt-3">
          <p className="mb-4 text-xs text-[var(--color-muted)]">
            {interpolate(t.dashboard.budgetThresholds, {
              warning: BUDGET_WARN_THRESHOLD,
              critical: BUDGET_CRITICAL_THRESHOLD,
            })}
          </p>
          {employees.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              {t.dashboard.noEmployeesYet}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>{t.common.employee}</TH>
                      <TH className="text-right">{t.common.budget}</TH>
                      <TH className="text-right">{t.common.spent}</TH>
                      <TH className="text-right">{t.common.remaining}</TH>
                      <TH className="w-48">{t.common.usage}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {employees.map((e) => (
                      <TR key={e.id}>
                        <TD className="font-medium">
                          {e.firstName} {e.lastName}
                        </TD>
                        <TD className="text-right">{formatMoney(e.annualBudget)}</TD>
                        <TD className="text-right">{formatMoney(e.status.spent)}</TD>
                        <TD className="text-right">
                          {formatMoney(e.status.remaining)}
                        </TD>
                        <TD>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BudgetBar
                                percent={e.status.percent}
                                level={e.status.level}
                                label={`${t.budgetLevels[e.status.level]}: ${e.status.percent}%`}
                              />
                              <span className="w-12 text-right text-xs text-slate-500">
                                {e.status.percent}%
                              </span>
                            </div>
                            <span className="block text-xs text-[var(--color-muted)]">
                              {t.budgetLevels[e.status.level]}
                            </span>
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {employees.map((e) => (
                  <MobileCard key={e.id}>
                    <p className="mb-2 font-medium">
                      {e.firstName} {e.lastName}
                    </p>
                    <MobileCardRow label={t.common.budget}>
                      {formatMoney(e.annualBudget)}
                    </MobileCardRow>
                    <MobileCardRow label={t.common.spent}>
                      {formatMoney(e.status.spent)}
                    </MobileCardRow>
                    <MobileCardRow label={t.common.remaining}>
                      {formatMoney(e.status.remaining)}
                    </MobileCardRow>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <BudgetBar
                          percent={e.status.percent}
                          level={e.status.level}
                          label={`${t.budgetLevels[e.status.level]}: ${e.status.percent}%`}
                        />
                        <span className="w-12 text-right text-xs text-slate-500">
                          {e.status.percent}%
                        </span>
                      </div>
                      <span className="block text-xs text-[var(--color-muted)]">
                        {t.budgetLevels[e.status.level]}
                      </span>
                    </div>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RecentPurchases rows={recentRows} />
    </div>
  );
}
