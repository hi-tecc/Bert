import Link from "next/link";
import { Plus } from "lucide-react";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear } from "@/lib/budget";
import { employeeSpentMap } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { ListToolbar } from "@/components/list-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";
import { BudgetBar } from "@/components/ui/budget-bar";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireShopAdmin();
  const { q, status } = await searchParams;
  const year = currentYear();

  const companies = await prisma.company.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(status === "active"
        ? { active: true }
        : status === "inactive"
          ? { active: false }
          : {}),
    },
    include: { employees: { select: { id: true, annualBudget: true } } },
    orderBy: { name: "asc" },
  });

  const spent = await employeeSpentMap(
    companies.flatMap((c) => c.employees.map((e) => e.id)),
    year,
  );

  const rows = companies.map((c) => {
    const totalBudget = c.employees.reduce((s, e) => s + e.annualBudget, 0);
    const totalSpent = c.employees.reduce(
      (s, e) => s + (spent.get(e.id) ?? 0),
      0,
    );
    return { company: c, totalBudget, totalSpent, bs: budgetStatus(totalSpent, totalBudget) };
  });

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Manage customer companies"
        action={
          <Link
            href="/companies/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New company
          </Link>
        }
      />

      <ListToolbar placeholder="Search companies by name..." />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No companies found.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Company</TH>
                      <TH>Contact</TH>
                      <TH className="text-center">Employees</TH>
                      <TH className="w-56">Budget usage</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {rows.map(({ company: c, totalBudget, totalSpent, bs }) => (
                      <TR key={c.id}>
                        <TD>
                          <Link
                            href={`/companies/${c.id}`}
                            className="font-medium text-[var(--color-primary)] hover:underline"
                          >
                            {c.name}
                          </Link>
                        </TD>
                        <TD className="text-slate-600">
                          {c.contactPerson ?? "—"}
                          {c.email && (
                            <span className="block text-xs text-slate-400">
                              {c.email}
                            </span>
                          )}
                        </TD>
                        <TD className="text-center">{c.employees.length}</TD>
                        <TD>
                          <BudgetBar percent={bs.percent} level={bs.level} />
                          <span className="mt-1 block text-xs text-slate-500">
                            {formatMoney(totalSpent)} / {formatMoney(totalBudget)}
                          </span>
                        </TD>
                        <TD>
                          <Badge tone={c.active ? "success" : "neutral"}>
                            {c.active ? "Active" : "Inactive"}
                          </Badge>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <MobileCards>
                {rows.map(({ company: c, totalBudget, totalSpent, bs }) => (
                  <MobileCard key={c.id}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <Link
                        href={`/companies/${c.id}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {c.name}
                      </Link>
                      <Badge tone={c.active ? "success" : "neutral"}>
                        {c.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {c.contactPerson && (
                      <p className="mb-2 text-sm text-slate-500">
                        {c.contactPerson}
                        {c.email ? ` · ${c.email}` : ""}
                      </p>
                    )}
                    <MobileCardRow label="Employees">
                      {c.employees.length}
                    </MobileCardRow>
                    <div className="mt-2">
                      <BudgetBar percent={bs.percent} level={bs.level} />
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatMoney(totalSpent)} / {formatMoney(totalBudget)}
                      </span>
                    </div>
                  </MobileCard>
                ))}
              </MobileCards>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
