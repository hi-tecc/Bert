import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireUser, isShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { deletePurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { ListToolbar } from "@/components/list-toolbar";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { getT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/config";

const PAGE_SIZE = 50;

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const t = await getT();
  const { q, page: requestedPage, sort: requestedSort } = await searchParams;
  const shopAdmin = isShopAdmin(user);
  const sort = ["date-desc", "date-asc", "amount-desc", "amount-asc"].includes(
    requestedSort ?? "",
  )
    ? requestedSort!
    : "date-desc";
  const parsedPage = Number.parseInt(requestedPage ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

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

  const orderBy: Prisma.PurchaseOrderByWithRelationInput =
    sort === "date-asc"
      ? { date: "asc" }
      : sort === "amount-desc"
        ? { amount: "desc" }
        : sort === "amount-asc"
          ? { amount: "asc" }
          : { date: "desc" };
  const totalCount = await prisma.purchase.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const purchases = await prisma.purchase.findMany({
    where,
    include: { employee: { include: { company: { select: { name: true } } } } },
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const firstResult = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, totalCount);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort !== "date-desc") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/purchases?${query}` : "/purchases";
  }

  return (
    <div>
      <PageHeader
        title={t.common.purchases}
        subtitle={shopAdmin ? t.purchases.subtitleAll : t.purchases.subtitleOwn}
        action={
          shopAdmin ? (
            <Link
              href="/purchases/new"
              className="inline-flex h-11 items-center gap-2 rounded-none bg-[var(--color-foreground)] px-6 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
            >
              <Plus className="h-4 w-4" /> {t.purchases.register}
            </Link>
          ) : undefined
        }
      />

      <ListToolbar
        placeholder={t.purchases.searchPlaceholder}
        withStatusFilter={false}
        sortOptions={[
          { value: "date-desc", label: t.purchases.sortNewest },
          { value: "date-asc", label: t.purchases.sortOldest },
          { value: "amount-desc", label: t.purchases.sortHighest },
          { value: "amount-asc", label: t.purchases.sortLowest },
        ]}
      />

      <p className="mb-3 text-sm text-[var(--color-muted)]" aria-live="polite">
        {interpolate(t.purchases.resultsSummary, {
          from: firstResult,
          to: lastResult,
          count: totalCount,
        })}
      </p>

      <Card>
        <CardContent className="p-0">
          {purchases.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {t.purchases.none}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>{t.common.date}</TH>
                      <TH>{t.common.description}</TH>
                      <TH>{t.common.employee}</TH>
                      <TH>{t.common.company}</TH>
                      <TH className="text-right">{t.common.amount}</TH>
                      {shopAdmin && <TH className="text-right">{t.common.actions}</TH>}
                    </TR>
                  </THead>
                  <TBody>
                    {purchases.map((p) => (
                      <TR key={p.id}>
                        <TD className="whitespace-nowrap text-slate-500">
                          {formatDate(p.date)}
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
                                {t.common.edit}
                              </Link>
                              <DeleteButton
                                id={p.id}
                                action={deletePurchaseAction}
                                label=""
                                confirmMessage={t.purchases.confirmDelete}
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
                    <MobileCardRow label={t.common.date}>
                      {formatDate(p.date)}
                    </MobileCardRow>
                    <MobileCardRow label={t.common.employee}>
                      {p.employee.firstName} {p.employee.lastName}
                    </MobileCardRow>
                    <MobileCardRow label={t.common.company}>
                      {p.employee.company.name}
                    </MobileCardRow>
                    {shopAdmin && (
                      <div className="mt-3 flex items-center justify-end gap-3">
                        <Link
                          href={`/purchases/${p.id}/edit`}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          {t.common.edit}
                        </Link>
                        <DeleteButton
                          id={p.id}
                          action={deletePurchaseAction}
                          label={t.common.delete}
                          confirmMessage={t.purchases.confirmDelete}
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
      {totalPages > 1 && (
        <nav
          aria-label={t.purchases.pagination}
          className="mt-4 flex items-center justify-between gap-4"
        >
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {t.purchases.previousPage}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-[var(--color-muted)]">
            {interpolate(t.purchases.pageSummary, {
              page: currentPage,
              pages: totalPages,
            })}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {t.purchases.nextPage}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
