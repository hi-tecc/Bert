import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fromCents } from "@/lib/money";
import { updatePurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireShopAdmin();
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) notFound();

  const employees = await prisma.employee.findMany({
    include: { company: { select: { name: true } } },
    orderBy: [{ company: { name: "asc" } }, { lastName: "asc" }],
  });
  const options = employees.map((e) => ({
    id: e.id,
    label: `${e.company.name} — ${e.firstName} ${e.lastName}`,
  }));

  const action = updatePurchaseAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit purchase" subtitle="Correct a purchase record" />
      <PurchaseForm
        action={action}
        employees={options}
        defaultValues={{
          employeeId: purchase.employeeId,
          date: format(purchase.date, "yyyy-MM-dd"),
          amountDollars: fromCents(purchase.amount),
          description: purchase.description,
          notes: purchase.notes,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
