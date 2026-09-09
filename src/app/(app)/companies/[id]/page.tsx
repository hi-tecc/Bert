import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Power } from "lucide-react";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear } from "@/lib/budget";
import { getEmployeesWithBudget } from "@/lib/queries";
import {
  deleteCompanyAction,
  toggleCompanyActiveAction,
} from "@/lib/actions/companies";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { BudgetBar } from "@/components/ui/budget-bar";
import { BudgetStatusBadge } from "@/components/budget-status-badge";
import { Users, Wallet, Euro, PiggyBank } from "lucide-react";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireShopAdmin();
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  const year = currentYear();
  const employees = await getEmployeesWithBudget({ companyId: id }, year);
  const totalBudget = employees.reduce((s, e) => s + e.annualBudget, 0);
  const totalSpent = employees.reduce((s, e) => s + e.status.spent, 0);
  const summary = budgetStatus(totalSpent, totalBudget);

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={company.address ?? undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/employees/new?companyId=${id}`}
              className="inline-flex h-9 items-center gap-2 rounded-none bg-[var(--color-foreground)] px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-primary-foreground)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
            >
              <Plus className="h-4 w-4" /> Add employee
            </Link>
            <Link
              href={`/companies/${id}/edit`}
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <form action={toggleCompanyActiveAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]"
              >
                <Power className="h-4 w-4" />
                {company.active ? "Deactivate" : "Activate"}
              </button>
            </form>
            <DeleteButton
              id={id}
              action={deleteCompanyAction}
              confirmMessage="Delete this company and all its employees and purchases?"
            />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle emphasizeLast>Company details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Status">
              <Badge tone={company.active ? "success" : "neutral"}>
                {company.active ? "Active" : "Inactive"}
              </Badge>
            </Row>
            <Row label="Contact">{company.contactPerson ?? "—"}</Row>
            <Row label="Email">{company.email ?? "—"}</Row>
            <Row label="Phone">{company.phone ?? "—"}</Row>
            <Row label="Address">{company.address ?? "—"}</Row>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          <StatCard label="Employees" value={String(employees.length)} icon={Users} />
          <StatCard label="Annual budget" value={formatMoney(totalBudget)} icon={Wallet} />
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
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Employees</CardTitle>
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
                      <TH className="w-40">Usage</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {employees.map((e) => (
                      <TR key={e.id}>
                        <TD>
                          <Link
                            href={`/employees/${e.id}`}
                            className="font-medium text-[var(--color-primary)] hover:underline"
                          >
                            {e.firstName} {e.lastName}
                          </Link>
                          {!e.active && (
                            <Badge tone="neutral" className="ml-2">
                              Inactive
                            </Badge>
                          )}
                        </TD>
                        <TD className="text-right">{formatMoney(e.annualBudget)}</TD>
                        <TD className="text-right">{formatMoney(e.status.spent)}</TD>
                        <TD className="text-right">
                          {formatMoney(e.status.remaining)}
                        </TD>
                        <TD>
                          <BudgetBar
                            percent={e.status.percent}
                            level={e.status.level}
                          />
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {employees.map((e) => (
                  <MobileCard key={e.id}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <Link
                        href={`/employees/${e.id}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {e.firstName} {e.lastName}
                      </Link>
                      {!e.active && <Badge tone="neutral">Inactive</Badge>}
                    </div>
                    <MobileCardRow label="Budget">
                      {formatMoney(e.annualBudget)}
                    </MobileCardRow>
                    <MobileCardRow label="Spent">
                      {formatMoney(e.status.spent)}
                    </MobileCardRow>
                    <MobileCardRow label="Remaining">
                      {formatMoney(e.status.remaining)}
                    </MobileCardRow>
                    <div className="mt-2">
                      <BudgetBar
                        percent={e.status.percent}
                        level={e.status.level}
                      />
                    </div>
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

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  );
}
