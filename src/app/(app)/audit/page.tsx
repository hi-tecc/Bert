import type { Prisma } from "@prisma/client";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

const actionTone: Record<string, "success" | "warning" | "danger"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { entity } = await searchParams;

  const where: Prisma.AuditLogWhereInput =
    entity && entity !== "all" ? { entityType: entity } : {};

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

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

  return (
    <div>
      <PageHeader
        title={t.audit.title}
        subtitle={t.audit.subtitle}
        emphasizeLast
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "Company", "Employee", "Purchase", "User"].map((e) => {
          const active = (entity ?? "all") === e;
          return (
            <a
              key={e}
              href={e === "all" ? "/audit" : `/audit?entity=${e}`}
              className={
                "rounded-none px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 " +
                (active
                  ? "bg-[var(--color-foreground)] text-[var(--color-primary-foreground)]"
                  : "border border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]")
              }
            >
              {entityLabels[e] ?? e}
            </a>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {t.audit.none}
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
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
                        <TD className="whitespace-nowrap text-slate-500">
                          {formatDateTime(log.createdAt)}
                        </TD>
                        <TD className="text-slate-600">
                          {log.user?.name ?? t.audit.system}
                        </TD>
                        <TD>
                          <Badge tone={actionTone[log.action] ?? "neutral"}>
                            {actionLabels[log.action] ?? log.action}
                          </Badge>
                        </TD>
                        <TD className="text-slate-600">
                          {entityLabels[log.entityType] ?? log.entityType}
                          <span className="block font-mono text-xs text-slate-400">
                            {log.entityId.slice(0, 10)}…
                          </span>
                        </TD>
                        <TD className="max-w-xs">
                          {log.changes ? (
                            <code className="block truncate text-xs text-slate-500">
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
              </div>

              <MobileCards>
                {logs.map((log) => (
                  <MobileCard key={log.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Badge tone={actionTone[log.action] ?? "neutral"}>
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <MobileCardRow label={t.audit.thEntity}>{entityLabels[log.entityType] ?? log.entityType}</MobileCardRow>
                    <MobileCardRow label={t.audit.thUser}>
                      {log.user?.name ?? t.audit.system}
                    </MobileCardRow>
                    {log.changes && (
                      <code className="mt-2 block truncate text-xs text-slate-500">
                        {log.changes}
                      </code>
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
