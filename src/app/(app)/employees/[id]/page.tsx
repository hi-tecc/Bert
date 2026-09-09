import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { requireUser, assertCompanyAccess, isShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { budgetStatus, currentYear, yearRange } from "@/lib/budget";
import { deleteEmployeeAction } from "@/lib/actions/employees";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { BudgetBar } from "@/components/ui/budget-bar";
import { BudgetStatusBadge } from "@/components/budget-status-badge";
import { Wallet, Euro, PiggyBank } from "lucide-react";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!employee) notFound();
  assertCompanyAccess(user, employee.companyId);

  const year = currentYear();
  const { start, end } = yearRange(year);
  const shopAdmin = isShopAdmin(user);

  const purchases = await prisma.purchase.findMany({
    where: { employeeId: id, date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  const spent = purchases.reduce((s, p) => s + p.amount, 0);
  const bs = budgetStatus(spent, employee.annualBudget);

  return (
    <div>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        subtitle={`${employee.email} · ${employee.company.name}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {shopAdmin && (
              <Link
                href={`/purchases/new?employeeId=${id}`}
                className="inline-flex h-9 items-center gap-2 rounded-none bg-[var(--color-foreground)] px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-primary-foreground)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
              >
                <Plus className="h-4 w-4" /> Add purchase
              </Link>
            )}
            <Link
              href={`/employees/${id}/edit`}
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <DeleteButton
              id={id}
              action={deleteEmployeeAction}
              confirmMessage="Delete this employee and all their purchases?"
            />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Annual budget" value={formatMoney(employee.annualBudget)} icon={Wallet} />
        <StatCard
          label={`Spent in ${year}`}
          value={formatMoney(spent)}
          hint={`${bs.percent}% of budget`}
          icon={Euro}
        />
        <StatCard label="Remaining" value={formatMoney(bs.remaining)} icon={PiggyBank} />
        <Card className="p-5">
          <p className="text-sm text-slate-500">Status</p>
          <div className="mt-2">
            <BudgetStatusBadge level={bs.level} percent={bs.percent} />
          </div>
          <BudgetBar
            percent={bs.percent}
            level={bs.level}
            className="mt-3"
          />
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Purchase history · {year}</CardTitle>
          {!employee.active && <Badge tone="neutral">Inactive employee</Badge>}
        </CardHeader>
        <CardContent className="pt-3">
          {purchases.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No purchases this year.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Date</TH>
                      <TH>Description</TH>
                      <TH className="text-right">Amount</TH>
                      {shopAdmin && <TH className="text-right">Actions</TH>}
                    </TR>
                  </THead>
                  <TBody>
                    {purchases.map((p) => (
                      <TR key={p.id}>
                        <TD className="whitespace-nowrap text-slate-500">
                          {format(p.date, "MMM d, yyyy")}
                        </TD>
                        <TD>
                          <span className="font-medium">{p.description}</span>
                          {p.notes && (
                            <span className="block text-xs text-slate-400">
                              {p.notes}
                            </span>
                          )}
                        </TD>
                        <TD className="text-right font-medium">
                          {formatMoney(p.amount)}
                        </TD>
                        {shopAdmin && (
                          <TD className="text-right">
                            <Link
                              href={`/purchases/${p.id}/edit`}
                              className="text-sm text-[var(--color-primary)] hover:underline"
                            >
                              Edit
                            </Link>
                          </TD>
                        )}
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {purchases.map((p) => (
                  <MobileCard key={p.id}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="font-medium">{p.description}</span>
                      <span className="font-medium">{formatMoney(p.amount)}</span>
                    </div>
                    {p.notes && (
                      <p className="mb-2 text-xs text-slate-400">{p.notes}</p>
                    )}
                    <MobileCardRow label="Date">
                      {format(p.date, "MMM d, yyyy")}
                    </MobileCardRow>
                    {shopAdmin && (
                      <div className="mt-3 text-right">
                        <Link
                          href={`/purchases/${p.id}/edit`}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    )}
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
