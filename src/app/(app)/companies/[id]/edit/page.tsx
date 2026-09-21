import { notFound } from "next/navigation";
import { requireShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateCompanyAction } from "@/lib/actions/companies";
import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "@/components/companies/company-form";
import { getT } from "@/lib/i18n/server";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireShopAdmin();
  const t = await getT();
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  const action = updateCompanyAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={t.companies.editTitle} subtitle={company.name} emphasizeLast />
      <CompanyForm
        action={action}
        submitLabel={t.common.saveChanges}
        defaultValues={company}
      />
    </div>
  );
}
