import { prisma } from "./prisma";
import { budgetStatus, yearRange, type BudgetStatus } from "./budget";

/** Sum of purchase amounts (cents) per employee within a calendar year. */
export async function employeeSpentMap(
  employeeIds: string[],
  year: number,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (employeeIds.length === 0) return map;

  const { start, end } = yearRange(year);
  const grouped = await prisma.purchase.groupBy({
    by: ["employeeId"],
    where: { employeeId: { in: employeeIds }, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  for (const g of grouped) map.set(g.employeeId, g._sum.amount ?? 0);
  return map;
}

export interface EmployeeWithBudget {
  id: string;
  companyId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  annualBudget: number;
  status: BudgetStatus;
}

/** Employees (optionally scoped by company) enriched with current-year budget status. */
export async function getEmployeesWithBudget(
  where: { companyId?: string; active?: boolean },
  year: number,
): Promise<EmployeeWithBudget[]> {
  const employees = await prisma.employee.findMany({
    where,
    include: { company: { select: { name: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const spent = await employeeSpentMap(
    employees.map((e) => e.id),
    year,
  );

  return employees.map((e) => ({
    id: e.id,
    companyId: e.companyId,
    companyName: e.company.name,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    active: e.active,
    annualBudget: e.annualBudget,
    status: budgetStatus(spent.get(e.id) ?? 0, e.annualBudget),
  }));
}

export interface CompanyBudgetSummary {
  companyId: string;
  companyName: string;
  employeeCount: number;
  totalBudget: number;
  totalSpent: number;
  status: BudgetStatus;
}

/** Per-company aggregated budget vs. spending for the given year. */
export async function getCompanyBudgetSummaries(
  where: { id?: string; active?: boolean },
  year: number,
): Promise<CompanyBudgetSummary[]> {
  const companies = await prisma.company.findMany({
    where,
    include: { employees: { select: { id: true, annualBudget: true } } },
    orderBy: { name: "asc" },
  });

  const allEmployeeIds = companies.flatMap((c) => c.employees.map((e) => e.id));
  const spent = await employeeSpentMap(allEmployeeIds, year);

  return companies.map((c) => {
    const totalBudget = c.employees.reduce((s, e) => s + e.annualBudget, 0);
    const totalSpent = c.employees.reduce(
      (s, e) => s + (spent.get(e.id) ?? 0),
      0,
    );
    return {
      companyId: c.id,
      companyName: c.name,
      employeeCount: c.employees.length,
      totalBudget,
      totalSpent,
      status: budgetStatus(totalSpent, totalBudget),
    };
  });
}
