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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:opacity-90"
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
                              className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium hover:bg-slate-50"
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
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium hover:bg-slate-50"
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
