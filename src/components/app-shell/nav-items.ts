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

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  shopOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2, shopOnly: true },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/users", label: "Users", icon: UserCog, shopOnly: true },
  { href: "/audit", label: "Audit log", icon: History, shopOnly: true },
];

export function navItemsForRole(role: Role): NavItem[] {
  const isShopAdmin = role === ROLES.SHOP_ADMIN;
  return NAV_ITEMS.filter((item) => !item.shopOnly || isShopAdmin);
}

export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
