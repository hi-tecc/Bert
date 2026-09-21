import Link from "next/link";
import { Building2, Users, Euro, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { currentYear, yearRange } from "@/lib/budget";
import { getCompanyBudgetSummaries } from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetBar } from "@/components/ui/budget-bar";
import { BudgetStatusBadge } from "@/components/budget-status-badge";
import {
  RecentPurchases,
  type RecentPurchaseRow,
} from "@/components/dashboard/recent-purchases";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { getT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/config";
import {
  BUDGET_CRITICAL_THRESHOLD,
  BUDGET_WARN_THRESHOLD,
} from "@/lib/constants";

export async function ShopDashboard() {
  const t = await getT();
  const year = currentYear();
  const { start, end } = yearRange(year);

  const [companiesCount, employeesCount, allTime, thisYear, recent, summaries] =
    await Promise.all([
      prisma.company.count(),
      prisma.employee.count(),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.purchase.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lt: end } },
      }),
      prisma.purchase.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { employee: { include: { company: true } } },
      }),
      getCompanyBudgetSummaries({}, year),
    ]);

  const recentRows: RecentPurchaseRow[] = recent.map((p) => ({
    id: p.id,
    date: p.date,
    amount: p.amount,
    description: p.description,
    employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
    companyName: p.employee.company.name,
  }));

  const nearing = summaries
    .filter((s) => s.status.level !== "ok" && s.totalBudget > 0)
    .sort((a, b) => b.status.percent - a.status.percent);

  const chartData = summaries.map((s) => ({
    name: s.companyName,
    Budget: s.totalBudget,
    Spent: s.totalSpent,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{t.dashboard.title}</h1>
        <p className="mt-1.5 text-sm text-[var(--color-muted)]">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.dashboard.statCompanies} value={String(companiesCount)} icon={Building2} />
        <StatCard label={t.dashboard.statEmployees} value={String(employeesCount)} icon={Users} />
        <StatCard
          label={t.dashboard.statTotalSpending}
          value={formatMoney(allTime._sum.amount ?? 0)}
          hint={t.dashboard.allTime}
          icon={Euro}
        />
        <StatCard
          label={interpolate(t.dashboard.spendingIn, { year })}
          value={formatMoney(thisYear._sum.amount ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t.dashboard.chartTitlePrefix}
              <span className="italic text-[var(--color-accent)]">{t.dashboard.chartTitleAccent}</span>
              {t.dashboard.chartTitleSuffix}
            </CardTitle>
            <p className="text-xs text-[var(--color-muted)]">
              {interpolate(t.dashboard.calendarYear, { year })}
            </p>
          </CardHeader>
          <CardContent>
            {chartData.length ? (
              <SpendingChart data={chartData} />
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                {t.dashboard.noCompanies}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle emphasizeLast>{t.dashboard.nearingTitle}</CardTitle>
            <p className="text-xs text-[var(--color-muted)]">
              {interpolate(t.dashboard.budgetThresholds, {
                warning: BUDGET_WARN_THRESHOLD,
                critical: BUDGET_CRITICAL_THRESHOLD,
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearing.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                {t.dashboard.allOnTrack}
              </p>
            ) : (
              nearing.map((s) => (
                <Link
                  key={s.companyId}
                  href={`/companies/${s.companyId}`}
                  className="block rounded-none border border-[var(--color-border)] p-3 transition-colors duration-200 hover:bg-[var(--color-muted-bg)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium">{s.companyName}</span>
                    <BudgetStatusBadge
                      level={s.status.level}
                      percent={s.status.percent}
                    />
                  </div>
                  <BudgetBar percent={s.status.percent} level={s.status.level} />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {formatMoney(s.totalSpent)} {t.common.of} {formatMoney(s.totalBudget)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {interpolate(t.dashboard.remainingAmount, {
                      amount: formatMoney(s.status.remaining),
                    })}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <RecentPurchases rows={recentRows} showCompany />
    </div>
  );
}
