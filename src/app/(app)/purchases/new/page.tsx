import { format } from "date-fns";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createPurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getT } from "@/lib/i18n/server";

export default async function NewPurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { employeeId } = await searchParams;

  const [companies, employees] = await Promise.all([
    prisma.company.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { active: true },
      orderBy: [{ company: { name: "asc" } }, { lastName: "asc" }],
    }),
  ]);

  const companyOptions = companies.map((c) => ({ id: c.id, label: c.name }));
  const employeeOptions = employees.map((e) => ({
    id: e.id,
    companyId: e.companyId,
    label: `${e.firstName} ${e.lastName}`,
  }));

  return (
    <div className="max-w-2xl">
      <PageHeader title={t.purchases.newTitle} subtitle={t.purchases.newSubtitle} emphasizeLast />
      <PurchaseForm
        action={createPurchaseAction}
        companies={companyOptions}
        employees={employeeOptions}
        defaultValues={{
          employeeId,
          date: format(new Date(), "yyyy-MM-dd"),
        }}
        submitLabel={t.purchases.register}
      />
    </div>
  );
}
