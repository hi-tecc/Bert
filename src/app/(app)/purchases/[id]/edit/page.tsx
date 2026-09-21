import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fromCents } from "@/lib/money";
import { updatePurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getT } from "@/lib/i18n/server";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) notFound();

  const [companies, employees] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      orderBy: [{ company: { name: "asc" } }, { lastName: "asc" }],
    }),
  ]);
  const companyOptions = companies.map((c) => ({ id: c.id, label: c.name }));
  const employeeOptions = employees.map((e) => ({
    id: e.id,
    companyId: e.companyId,
    label: `${e.firstName} ${e.lastName}`,
  }));

  const action = updatePurchaseAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={t.purchases.editTitle} subtitle={t.purchases.editSubtitle} emphasizeLast />
      <PurchaseForm
        action={action}
        companies={companyOptions}
        employees={employeeOptions}
        defaultValues={{
          employeeId: purchase.employeeId,
          date: format(purchase.date, "yyyy-MM-dd"),
          amountDollars: fromCents(purchase.amount),
          description: purchase.description,
          notes: purchase.notes,
        }}
        submitLabel={t.common.saveChanges}
      />
    </div>
  );
}
