import { Users, Euro, Wallet, PiggyBank } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear, yearRange } from "@/lib/budget";
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

export async function CompanyDashboard({ companyId }: { companyId: string }) {
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
        <h1 className="text-2xl font-semibold">{company.name}</h1>
        <p className="text-sm text-slate-500">Company overview · {year}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees" value={String(employees.length)} icon={Users} />
        <StatCard
          label="Annual budget"
          value={formatMoney(totalBudget)}
          icon={Wallet}
        />
        <StatCard
          label="Spent"
          value={formatMoney(totalSpent)}
          hint={`${summary.percent}% of budget`}
          icon={Euro}
        />
        <StatCard
          label="Remaining"
          value={formatMoney(summary.remaining)}
          icon={PiggyBank}
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Employee budgets</CardTitle>
          <BudgetStatusBadge level={summary.level} percent={summary.percent} />
        </CardHeader>
        <CardContent className="pt-3">
          {employees.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No employees yet.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Employee</TH>
                      <TH className="text-right">Budget</TH>
                      <TH className="text-right">Spent</TH>
                      <TH className="text-right">Remaining</TH>
                      <TH className="w-48">Usage</TH>
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
                          <div className="flex items-center gap-2">
                            <BudgetBar
                              percent={e.status.percent}
                              level={e.status.level}
                            />
                            <span className="w-12 text-right text-xs text-slate-500">
                              {e.status.percent}%
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
                    <MobileCardRow label="Budget">
                      {formatMoney(e.annualBudget)}
                    </MobileCardRow>
                    <MobileCardRow label="Spent">
                      {formatMoney(e.status.spent)}
                    </MobileCardRow>
                    <MobileCardRow label="Remaining">
                      {formatMoney(e.status.remaining)}
                    </MobileCardRow>
                    <div className="mt-2 flex items-center gap-2">
                      <BudgetBar
                        percent={e.status.percent}
                        level={e.status.level}
                      />
                      <span className="w-12 text-right text-xs text-slate-500">
                        {e.status.percent}%
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
