import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { createEmployeeAction } from "@/lib/actions/employees";
import { PageHeader } from "@/components/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const user = await requireUser();
  const { companyId } = await searchParams;
  const isShopAdmin = user.role === ROLES.SHOP_ADMIN;

  const companies = isShopAdmin
    ? await prisma.company.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="max-w-2xl">
      <PageHeader title="New employee" subtitle="Add an employee to a company" />
      <EmployeeForm
        action={createEmployeeAction}
        companies={companies}
        lockedCompanyId={isShopAdmin ? undefined : (user.companyId ?? undefined)}
        defaultValues={companyId ? { companyId } : undefined}
        submitLabel="Create employee"
      />
    </div>
  );
}
