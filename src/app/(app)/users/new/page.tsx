import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createUserAction } from "@/lib/actions/users";
import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/users/user-form";

export default async function NewUserPage() {
  await requireShopAdmin();
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="New user" subtitle="Add an admin or customer login" />
      <UserForm
        action={createUserAction}
        companies={companies}
        submitLabel="Create user"
      />
    </div>
  );
}
