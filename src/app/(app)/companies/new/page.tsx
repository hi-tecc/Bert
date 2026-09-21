import { requireShopAdmin } from "@/lib/session";
import { createCompanyAction } from "@/lib/actions/companies";
import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "@/components/companies/company-form";
import { getT } from "@/lib/i18n/server";

export default async function NewCompanyPage() {
  await requireShopAdmin();
  const t = await getT();
  return (
    <div className="max-w-2xl">
      <PageHeader title={t.companies.newTitle} subtitle={t.companies.newSubtitle} emphasizeLast />
      <CompanyForm action={createCompanyAction} submitLabel={t.companies.createSubmit} />
    </div>
  );
}
