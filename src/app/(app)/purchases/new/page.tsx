import { format } from "date-fns";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createPurchaseAction } from "@/lib/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";

export default async function NewPurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  await requireShopAdmin();
  const { employeeId } = await searchParams;

  const employees = await prisma.employee.findMany({
    where: { active: true },
    include: { company: { select: { name: true } } },
    orderBy: [{ company: { name: "asc" } }, { lastName: "asc" }],
  });

  const options = employees.map((e) => ({
    id: e.id,
    label: `${e.company.name} — ${e.firstName} ${e.lastName}`,
  }));

  return (
    <div className="max-w-2xl">
      <PageHeader title="Register purchase" subtitle="Record a new purchase" emphasizeLast />
      <PurchaseForm
        action={createPurchaseAction}
        employees={options}
        defaultValues={{
          employeeId,
          date: format(new Date(), "yyyy-MM-dd"),
        }}
        submitLabel="Register purchase"
      />
    </div>
  );
}
