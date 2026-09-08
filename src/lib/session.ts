import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLES, type Role } from "./constants";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  companyId?: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireShopAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== ROLES.SHOP_ADMIN) redirect("/");
  return user;
}

export function isShopAdmin(user: SessionUser): boolean {
  return user.role === ROLES.SHOP_ADMIN;
}

/** Redirect company admins away from data outside their own company. */
export function assertCompanyAccess(user: SessionUser, companyId: string): void {
  if (user.role === ROLES.SHOP_ADMIN) return;
  if (user.companyId !== companyId) redirect("/");
}

/**
 * Prisma `where` fragment that scopes company queries by role.
 * Shop admins see everything; company admins only their own company.
 */
export function companyScope(user: SessionUser): { id?: string } {
  if (user.role === ROLES.SHOP_ADMIN) return {};
  return { id: user.companyId ?? "__none__" };
}
