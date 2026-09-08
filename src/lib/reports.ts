import { prisma } from "./prisma";
import { budgetStatus, currentYear, yearRange, type BudgetStatus } from "./budget";
import { employeeSpentMap } from "./queries";
import { ROLES } from "./constants";
import type { SessionUser } from "./session";

export interface ReportParams {
  companyId?: string;
  employeeId?: string;
  from?: Date;
  to?: Date;
}

export interface ReportRow {
  date: Date;
  company: string;
  employee: string;
  description: string;
  notes: string | null;
  amount: number; // cents
}

export interface ReportEmployeeSummary {
  employee: string;
  company: string;
  status: BudgetStatus;
}

export interface ReportResult {
  title: string;
  rangeLabel: string;
  generatedAt: Date;
  rows: ReportRow[];
  total: number;
  count: number;
  employeeSummaries: ReportEmployeeSummary[];
}

/**
 * Build a report dataset honoring role-based scoping.
 * Company admins are always restricted to their own company.
 */
export async function buildReport(
  user: SessionUser,
  params: ReportParams,
): Promise<ReportResult> {
  const year = currentYear();
  const { start, end } = yearRange(year);
  const from = params.from ?? start;
  // Exclusive upper bound: include the whole "to" day.
  const to = params.to
    ? new Date(params.to.getFullYear(), params.to.getMonth(), params.to.getDate() + 1)
    : end;

  const forcedCompanyId =
    user.role === ROLES.SHOP_ADMIN ? params.companyId : user.companyId;

  const employeeWhere: {
    companyId?: string;
    id?: string;
  } = {};
  if (forcedCompanyId) employeeWhere.companyId = forcedCompanyId;
  if (params.employeeId) employeeWhere.id = params.employeeId;

  const purchases = await prisma.purchase.findMany({
    where: {
      date: { gte: from, lt: to },
      employee: employeeWhere,
    },
    include: { employee: { include: { company: { select: { name: true } } } } },
    orderBy: { date: "desc" },
  });

  const rows: ReportRow[] = purchases.map((p) => ({
    date: p.date,
    company: p.employee.company.name,
    employee: `${p.employee.firstName} ${p.employee.lastName}`,
    description: p.description,
    notes: p.notes,
    amount: p.amount,
  }));

  const total = rows.reduce((s, r) => s + r.amount, 0);

  // Budget summaries for the employees in scope (annual figures).
  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    include: { company: { select: { name: true } } },
    orderBy: [{ lastName: "asc" }],
  });
  const spent = await employeeSpentMap(
    employees.map((e) => e.id),
    year,
  );
  const employeeSummaries: ReportEmployeeSummary[] = employees.map((e) => ({
    employee: `${e.firstName} ${e.lastName}`,
    company: e.company.name,
    status: budgetStatus(spent.get(e.id) ?? 0, e.annualBudget),
  }));

  const scopeLabel = forcedCompanyId
    ? (employees[0]?.company.name ?? "Company")
    : "All companies";

  return {
    title: `Spending report — ${scopeLabel}`,
    rangeLabel: `${from.toLocaleDateString()} – ${new Date(to.getTime() - 1).toLocaleDateString()}`,
    generatedAt: new Date(),
    rows,
    total,
    count: rows.length,
    employeeSummaries,
  };
}
