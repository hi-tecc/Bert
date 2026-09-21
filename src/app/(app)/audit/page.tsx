import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/config";

const PAGE_SIZE = 50;

const actionTone: Record<string, "success" | "warning" | "danger"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { entity, page: requestedPage } = await searchParams;
  const parsedPage = Number.parseInt(requestedPage ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where: Prisma.AuditLogWhereInput =
    entity && entity !== "all" ? { entityType: entity } : {};

  const totalCount = await prisma.auditLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const firstResult = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, totalCount);

  const entityLabels: Record<string, string> = {
    all: t.audit.all,
    Company: t.audit.entityCompany,
    Employee: t.audit.entityEmployee,
    Purchase: t.audit.entityPurchase,
    User: t.audit.entityUser,
  };
  const actionLabels: Record<string, string> = {
    CREATE: t.audit.actionCreate,
    UPDATE: t.audit.actionUpdate,
    DELETE: t.audit.actionDelete,
  };

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (entity && entity !== "all") params.set("entity", entity);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/audit?${query}` : "/audit";
  }

  return (
    <div>
      <PageHeader
        title={t.audit.title}
        subtitle={t.audit.subtitle}
        emphasizeLast
      />

      <nav
        aria-label={t.audit.filterLabel}
        className="mb-4 flex flex-wrap gap-2"
      >
        {["all", "Company", "Employee", "Purchase", "User"].map((e) => {
          const active = (entity ?? "all") === e;
          return (
            <Link
              key={e}
              href={e === "all" ? "/audit" : `/audit?entity=${e}`}
              aria-current={active ? "page" : undefined}
              className={
                "inline-flex min-h-11 items-center rounded-none px-4 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] " +
                (active
                  ? "bg-[var(--color-foreground)] text-[var(--color-primary-foreground)]"
                  : "border border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]")
              }
            >
              {entityLabels[e] ?? e}
            </Link>
          );
        })}
      </nav>

      <p className="mb-3 text-sm text-[var(--color-muted)]" aria-live="polite">
        {interpolate(t.audit.resultsSummary, {
          from: firstResult,
          to: lastResult,
          count: totalCount,
        })}
      </p>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {t.audit.none}
            </p>
          ) : (
            <Table
              className="responsive-audit-table"
              containerClassName="max-md:overflow-visible"
            >
              <caption className="sr-only">{t.audit.tableCaption}</caption>
              <THead>
                <TR>
                  <TH>{t.audit.thWhen}</TH>
                  <TH>{t.audit.thUser}</TH>
                  <TH>{t.audit.thAction}</TH>
                  <TH>{t.audit.thEntity}</TH>
                  <TH>{t.audit.thChanges}</TH>
                </TR>
              </THead>
              <TBody>
                {logs.map((log) => (
                  <TR key={log.id}>
                    <TD
                      data-label={t.audit.thWhen}
                      className="whitespace-nowrap text-slate-500"
                    >
                      {formatDateTime(log.createdAt)}
                    </TD>
                    <TD data-label={t.audit.thUser} className="text-slate-600">
                      {log.user?.name ?? t.audit.system}
                    </TD>
                    <TD data-label={t.audit.thAction}>
                      <Badge tone={actionTone[log.action] ?? "neutral"}>
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                    </TD>
                    <TD
                      data-label={t.audit.thEntity}
                      className="text-slate-600"
                    >
                      {entityLabels[log.entityType] ?? log.entityType}
                      <span className="block font-mono text-xs text-slate-400">
                        {log.entityId.slice(0, 10)}…
                      </span>
                    </TD>
                    <TD data-label={t.audit.thChanges} className="max-w-xs">
                      {log.changes ? (
                        <code className="block break-all text-xs text-slate-500 md:truncate">
                          {log.changes}
                        </code>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <nav
          aria-label={t.audit.pagination}
          className="mt-4 flex items-center justify-between gap-4"
        >
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {t.audit.previousPage}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-[var(--color-muted)]">
            {interpolate(t.audit.pageSummary, {
              page: currentPage,
              pages: totalPages,
            })}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {t.audit.nextPage}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
