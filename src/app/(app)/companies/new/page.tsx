import { requireShopAdmin } from "@/lib/session";
import { createCompanyAction } from "@/lib/actions/companies";
import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "@/components/companies/company-form";

export default async function NewCompanyPage() {
  await requireShopAdmin();
  return (
    <div className="max-w-2xl">
      <PageHeader title="New company" subtitle="Add a customer company" emphasizeLast />
      <CompanyForm action={createCompanyAction} submitLabel="Create company" />
    </div>
  );
}
