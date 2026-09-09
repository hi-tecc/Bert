import { z } from "zod";
import { ROLES } from "./constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: optionalString,
  contactPerson: optionalString,
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || z.string().email().safeParse(v).success, {
      message: "Enter a valid email",
    }),
  phone: optionalString,
  active: z.coerce.boolean(),
});

export const employeeSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  annualBudget: z.coerce
    .number()
    .min(0, "Budget cannot be negative")
    .max(100_000_000, "Budget is too large"),
  active: z.coerce.boolean(),
});

export const purchaseSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.coerce.date({ message: "Enter a valid date" }),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(100_000_000, "Amount is too large"),
  description: z.string().trim().min(1, "Description is required"),
  notes: optionalString,
});

const userBase = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum([ROLES.SHOP_ADMIN, ROLES.COMPANY_ADMIN]),
  companyId: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null)),
});

/** A company admin must belong to a company; a shop admin must not. */
function refineCompany<T extends { role: string; companyId: string | null }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.role === ROLES.COMPANY_ADMIN && !data.companyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company is required for company admins",
      path: ["companyId"],
    });
  }
}

export const userCreateSchema = userBase
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine(refineCompany);

export const userUpdateSchema = userBase
  .extend({
    // Blank means "keep the current password".
    password: z
      .string()
      .optional()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || v.length >= 8, {
        message: "Password must be at least 8 characters",
      }),
  })
  .superRefine(refineCompany);

export type CompanyInput = z.infer<typeof companySchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
