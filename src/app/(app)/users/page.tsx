import Link from "next/link";
import { Plus } from "lucide-react";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { deleteUserAction } from "@/lib/actions/users";
import { PageHeader } from "@/components/page-header";
import { ListToolbar } from "@/components/list-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCards, MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const actor = await requireShopAdmin();
  const { q, role } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
      ...(role === ROLES.SHOP_ADMIN || role === ROLES.COMPANY_ADMIN
        ? { role }
        : {}),
    },
    include: { company: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const roleLabel = (r: string) =>
    r === ROLES.SHOP_ADMIN ? "Shop admin" : "Company admin";

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage admin and customer login accounts"
        action={
          <Link
            href="/users/new"
            className="inline-flex h-11 items-center gap-2 rounded-none bg-[var(--color-foreground)] px-6 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
          >
            <Plus className="h-4 w-4" /> New user
          </Link>
        }
      />

      <ListToolbar placeholder="Search users by name or email..." />

      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No users found.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Name</TH>
                      <TH>Email</TH>
                      <TH>Role</TH>
                      <TH>Company</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {users.map((u) => (
                      <TR key={u.id}>
                        <TD>
                          <Link
                            href={`/users/${u.id}/edit`}
                            className="font-medium text-[var(--color-primary)] hover:underline"
                          >
                            {u.name}
                          </Link>
                        </TD>
                        <TD className="text-slate-600">{u.email}</TD>
                        <TD>
                          <Badge
                            tone={u.role === ROLES.SHOP_ADMIN ? "success" : "neutral"}
                          >
                            {roleLabel(u.role)}
                          </Badge>
                        </TD>
                        <TD className="text-slate-600">
                          {u.company?.name ?? "—"}
                        </TD>
                        <TD>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/users/${u.id}/edit`}
                              className="inline-flex h-9 items-center rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]"
                            >
                              Edit
                            </Link>
                            {u.id !== actor.id && (
                              <DeleteButton id={u.id} action={deleteUserAction} />
                            )}
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>

              <MobileCards>
                {users.map((u) => (
                  <MobileCard key={u.id}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <Link
                        href={`/users/${u.id}/edit`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {u.name}
                      </Link>
                      <Badge
                        tone={u.role === ROLES.SHOP_ADMIN ? "success" : "neutral"}
                      >
                        {roleLabel(u.role)}
                      </Badge>
                    </div>
                    <MobileCardRow label="Email">{u.email}</MobileCardRow>
                    <MobileCardRow label="Company">
                      {u.company?.name ?? "—"}
                    </MobileCardRow>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/users/${u.id}/edit`}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-none border border-[var(--color-foreground)] bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-[var(--color-foreground)] hover:text-[var(--color-primary-foreground)]"
                      >
                        Edit
                      </Link>
                      {u.id !== actor.id && (
                        <DeleteButton id={u.id} action={deleteUserAction} />
                      )}
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
