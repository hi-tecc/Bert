import { notFound } from "next/navigation";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateUserAction } from "@/lib/actions/users";
import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/users/user-form";
import { getT } from "@/lib/i18n/server";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { id } = await params;
  const [user, companies] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!user) notFound();

  const action = updateUserAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={t.users.editTitle} subtitle={user.email} emphasizeLast />
      <UserForm
        action={action}
        companies={companies}
        submitLabel={t.common.saveChanges}
        isEdit
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        }}
      />
    </div>
  );
}
