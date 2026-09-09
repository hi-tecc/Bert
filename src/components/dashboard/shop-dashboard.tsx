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

export async function ShopDashboard() {
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview across all companies</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Companies" value={String(companiesCount)} icon={Building2} />
        <StatCard label="Employees" value={String(employeesCount)} icon={Users} />
        <StatCard
          label="Total spending"
          value={formatMoney(allTime._sum.amount ?? 0)}
          hint="All time"
          icon={Euro}
        />
        <StatCard
          label={`Spending in ${year}`}
          value={formatMoney(thisYear._sum.amount ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget vs. spending by company</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length ? (
              <SpendingChart data={chartData} />
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                No companies yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies nearing budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearing.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                All companies are on track.
              </p>
            ) : (
              nearing.map((s) => (
                <Link
                  key={s.companyId}
                  href={`/companies/${s.companyId}`}
                  className="block rounded-lg border border-[var(--color-border)] p-3 hover:bg-slate-50"
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
                    {formatMoney(s.totalSpent)} of {formatMoney(s.totalBudget)}
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
