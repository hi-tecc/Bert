import { requireUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import { ShopDashboard } from "@/components/dashboard/shop-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company-dashboard";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === ROLES.SHOP_ADMIN) {
    return <ShopDashboard />;
  }

  if (!user.companyId) {
    return (
      <p className="text-sm text-slate-500">
        Your account is not linked to a company. Contact the shop administrator.
      </p>
    );
  }

  return <CompanyDashboard companyId={user.companyId} />;
}
