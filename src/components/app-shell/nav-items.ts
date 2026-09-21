import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  ShoppingCart,
  FileBarChart,
  History,
} from "lucide-react";
import { ROLES, type Role } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface NavItem {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  shopOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/companies", labelKey: "companies", icon: Building2, shopOnly: true },
  { href: "/employees", labelKey: "employees", icon: Users },
  { href: "/purchases", labelKey: "purchases", icon: ShoppingCart },
  { href: "/reports", labelKey: "reports", icon: FileBarChart },
  { href: "/users", labelKey: "users", icon: UserCog, shopOnly: true },
  { href: "/audit", labelKey: "audit", icon: History, shopOnly: true },
];

export function navItemsForRole(role: Role): NavItem[] {
  const isShopAdmin = role === ROLES.SHOP_ADMIN;
  return NAV_ITEMS.filter((item) => !item.shopOnly || isShopAdmin);
}

export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
