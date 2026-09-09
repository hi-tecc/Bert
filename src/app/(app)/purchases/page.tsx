import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireUser, isShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { deletePurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { ListToolbar } from "@/components/list-toolbar";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const shopAdmin = isShopAdmin(user);

  const where: Prisma.PurchaseWhereInput = {
    ...(shopAdmin
      ? {}
      : { employee: { companyId: user.companyId ?? "__none__" } }),
    ...(q
      ? {
          OR: [
            { description: { contains: q } },
            { employee: { firstName: { contains: q } } },
            { employee: { lastName: { contains: q } } },
          ],
        }
      : {}),
  };

  const purchases = await prisma.purchase.findMany({
    where,
    include: { employee: { include: { company: { select: { name: true } } } } },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle={shopAdmin ? "All purchases" : "Your company's purchases"}
        action={
          shopAdmin ? (
            <Link
              href="/purchases/new"
              className="inline-flex h-11 items-center gap-2 rounded-none bg-[var(--color-foreground)] px-6 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
            >
              <Plus className="h-4 w-4" /> Register purchase
            </Link>
          ) : undefined
        }
      />

      <ListToolbar
        placeholder="Search by description or employee..."
        withStatusFilter={false}
      />

      <Card>
        <CardContent className="p-0">
          {purchases.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No purchases found.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Date</TH>
                      <TH>Description</TH>
                      <TH>Employee</TH>
                      <TH>Company</TH>
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
                        <TD className="text-slate-600">
                          {p.employee.firstName} {p.employee.lastName}
                        </TD>
                        <TD className="text-slate-600">{p.employee.company.name}</TD>
                        <TD className="text-right font-medium">
                          {formatMoney(p.amount)}
                        </TD>
                        {shopAdmin && (
                          <TD>
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/purchases/${p.id}/edit`}
                                className="text-sm text-[var(--color-primary)] hover:underline"
                              >
                                Edit
                              </Link>
                              <DeleteButton
                                id={p.id}
                                action={deletePurchaseAction}
                                label=""
                                confirmMessage="Delete this purchase?"
                              />
                            </div>
                          </TD>
                        )}
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <MobileCards>
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
                    <MobileCardRow label="Employee">
                      {p.employee.firstName} {p.employee.lastName}
                    </MobileCardRow>
                    <MobileCardRow label="Company">
                      {p.employee.company.name}
                    </MobileCardRow>
                    {shopAdmin && (
                      <div className="mt-3 flex items-center justify-end gap-3">
                        <Link
                          href={`/purchases/${p.id}/edit`}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          id={p.id}
                          action={deletePurchaseAction}
                          label="Delete"
                          confirmMessage="Delete this purchase?"
                        />
                      </div>
                    )}
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
