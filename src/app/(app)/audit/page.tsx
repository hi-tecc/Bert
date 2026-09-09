import { format } from "date-fns";
import type { Prisma } from "@prisma/client";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";

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
  const { entity } = await searchParams;

  const where: Prisma.AuditLogWhereInput =
    entity && entity !== "all" ? { entityType: entity } : {};

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Audit log"
        subtitle="All changes across the system"
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
              {e === "all" ? "All" : e}
            </a>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No audit entries.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>When</TH>
                      <TH>User</TH>
                      <TH>Action</TH>
                      <TH>Entity</TH>
                      <TH>Changes</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {logs.map((log) => (
                      <TR key={log.id}>
                        <TD className="whitespace-nowrap text-slate-500">
                          {format(log.createdAt, "MMM d, yyyy HH:mm")}
                        </TD>
                        <TD className="text-slate-600">
                          {log.user?.name ?? "System"}
                        </TD>
                        <TD>
                          <Badge tone={actionTone[log.action] ?? "neutral"}>
                            {log.action}
                          </Badge>
                        </TD>
                        <TD className="text-slate-600">
                          {log.entityType}
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
                        {log.action}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {format(log.createdAt, "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    <MobileCardRow label="Entity">{log.entityType}</MobileCardRow>
                    <MobileCardRow label="User">
                      {log.user?.name ?? "System"}
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
