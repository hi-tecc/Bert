import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear } from "@/lib/budget";
import { employeeSpentMap } from "@/lib/queries";
import type { Prisma } from "@prisma/client";
import { PageHeader } from "@/components/page-header";
import { ListToolbar } from "@/components/list-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";
import { BudgetBar } from "@/components/ui/budget-bar";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireUser();
  const { q, status } = await searchParams;
  const year = currentYear();
  const isShopAdmin = user.role === ROLES.SHOP_ADMIN;

  const where: Prisma.EmployeeWhereInput = {
    ...(isShopAdmin ? {} : { companyId: user.companyId ?? "__none__" }),
    ...(status === "active"
      ? { active: true }
      : status === "inactive"
        ? { active: false }
        : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const employees = await prisma.employee.findMany({
    where,
    include: { company: { select: { name: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const spent = await employeeSpentMap(
    employees.map((e) => e.id),
    year,
  );

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={isShopAdmin ? "All employees" : "Your company's employees"}
        action={
          <Link
            href="/employees/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New employee
          </Link>
        }
      />

      <ListToolbar placeholder="Search by name or email..." />

      <Card>
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No employees found.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Employee</TH>
                      {isShopAdmin && <TH>Company</TH>}
                      <TH className="text-right">Budget</TH>
                      <TH className="text-right">Spent</TH>
                      <TH className="w-48">Usage</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {employees.map((e) => {
                      const bs = budgetStatus(spent.get(e.id) ?? 0, e.annualBudget);
                      return (
                        <TR key={e.id}>
                          <TD>
                            <Link
                              href={`/employees/${e.id}`}
                              className="font-medium text-[var(--color-primary)] hover:underline"
                            >
                              {e.firstName} {e.lastName}
                            </Link>
                            <span className="block text-xs text-slate-400">
                              {e.email}
                            </span>
                          </TD>
                          {isShopAdmin && (
                            <TD className="text-slate-600">{e.company.name}</TD>
                          )}
                          <TD className="text-right">{formatMoney(e.annualBudget)}</TD>
                          <TD className="text-right">{formatMoney(bs.spent)}</TD>
                          <TD>
                            <div className="flex items-center gap-2">
                              <BudgetBar percent={bs.percent} level={bs.level} />
                              <span className="w-12 text-right text-xs text-slate-500">
                                {bs.percent}%
                              </span>
                            </div>
                          </TD>
                          <TD>
                            <Badge tone={e.active ? "success" : "neutral"}>
                              {e.active ? "Active" : "Inactive"}
                            </Badge>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>

              <MobileCards>
                {employees.map((e) => {
                  const bs = budgetStatus(spent.get(e.id) ?? 0, e.annualBudget);
                  return (
                    <MobileCard key={e.id}>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/employees/${e.id}`}
                            className="font-medium text-[var(--color-primary)] hover:underline"
                          >
                            {e.firstName} {e.lastName}
                          </Link>
                          <span className="block text-xs text-slate-400">
                            {e.email}
                          </span>
                        </div>
                        <Badge tone={e.active ? "success" : "neutral"}>
                          {e.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {isShopAdmin && (
                        <MobileCardRow label="Company">{e.company.name}</MobileCardRow>
                      )}
                      <MobileCardRow label="Budget">
                        {formatMoney(e.annualBudget)}
                      </MobileCardRow>
                      <MobileCardRow label="Spent">
                        {formatMoney(bs.spent)}
                      </MobileCardRow>
                      <div className="mt-2 flex items-center gap-2">
                        <BudgetBar percent={bs.percent} level={bs.level} />
                        <span className="w-12 text-right text-xs text-slate-500">
                          {bs.percent}%
                        </span>
                      </div>
                    </MobileCard>
                  );
                })}
              </MobileCards>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
