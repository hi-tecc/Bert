import { requireUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";
import { ShopDashboard } from "@/components/dashboard/shop-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company-dashboard";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === ROLES.SHOP_ADMIN) {
    return <ShopDashboard />;
  }

  if (!user.companyId) {
    const t = await getT();
    return (
      <p className="text-sm text-slate-500">
        {t.dashboard.notLinked}
      </p>
    );
  }

  return <CompanyDashboard companyId={user.companyId} />;
}
