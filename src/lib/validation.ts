import { z } from "zod";

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

export type CompanyInput = z.infer<typeof companySchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
