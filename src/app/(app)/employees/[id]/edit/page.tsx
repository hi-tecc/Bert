import { notFound } from "next/navigation";
import { requireUser, assertCompanyAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { fromCents } from "@/lib/money";
import { updateEmployeeAction } from "@/lib/actions/employees";
import { PageHeader } from "@/components/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) notFound();
  assertCompanyAccess(user, employee.companyId);

  const isShopAdmin = user.role === ROLES.SHOP_ADMIN;
  const companies = isShopAdmin
    ? await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const action = updateEmployeeAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit employee"
        subtitle={`${employee.firstName} ${employee.lastName}`}
        emphasizeLast
      />
      <EmployeeForm
        action={action}
        companies={companies}
        lockedCompanyId={isShopAdmin ? undefined : employee.companyId}
        defaultValues={{
          companyId: employee.companyId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          annualBudgetDollars: fromCents(employee.annualBudget),
          active: employee.active,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
