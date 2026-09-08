export const ROLES = {
  SHOP_ADMIN: "SHOP_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const ENTITY_TYPES = {
  COMPANY: "Company",
  EMPLOYEE: "Employee",
  PURCHASE: "Purchase",
  USER: "User",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const BUDGET_WARN_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_BUDGET_WARN_THRESHOLD ?? 80,
);
export const BUDGET_CRITICAL_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_BUDGET_CRITICAL_THRESHOLD ?? 90,
);
