"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { employeeSchema } from "@/lib/validation";
import { toCents } from "@/lib/money";
import { writeAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, ENTITY_TYPES, ROLES } from "@/lib/constants";
import { fieldErrorsFrom, type FormState } from "./form-state";

function parse(formData: FormData) {
  return employeeSchema.safeParse({
    companyId: formData.get("companyId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    annualBudget: formData.get("annualBudget"),
    active: formData.get("status") === "active",
  });
}

/** Company admins may only operate within their own company. */
function resolveCompanyId(
  user: { role: string; companyId?: string | null },
  requested: string,
): string | null {
  if (user.role === ROLES.SHOP_ADMIN) return requested;
  return user.companyId ?? null;
}

export async function createEmployeeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const companyId = resolveCompanyId(user, parsed.data.companyId);
  if (!companyId) return { error: "You cannot add employees to this company." };

  const employee = await prisma.employee.create({
    data: {
      companyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      annualBudget: toCents(parsed.data.annualBudget),
      active: parsed.data.active,
    },
  });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.EMPLOYEE,
    entityId: employee.id,
    changes: { ...parsed.data, companyId },
  });

  revalidatePath("/employees");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/employees/${employee.id}`);
}

export async function updateEmployeeAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) return { error: "Employee not found." };
  if (user.role !== ROLES.SHOP_ADMIN && user.companyId !== existing.companyId) {
    return { error: "You cannot edit this employee." };
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const companyId = resolveCompanyId(user, parsed.data.companyId);
  if (!companyId) return { error: "Invalid company." };

  await prisma.employee.update({
    where: { id },
    data: {
      companyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      annualBudget: toCents(parsed.data.annualBudget),
      active: parsed.data.active,
    },
  });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.EMPLOYEE,
    entityId: id,
    changes: { ...parsed.data, companyId },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath(`/companies/${companyId}`);
  redirect(`/employees/${id}`);
}

export async function deleteEmployeeAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) return;
  if (user.role !== ROLES.SHOP_ADMIN && user.companyId !== existing.companyId) {
    return;
  }

  await prisma.employee.delete({ where: { id } });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.EMPLOYEE,
    entityId: id,
  });
  revalidatePath("/employees");
  revalidatePath(`/companies/${existing.companyId}`);
  redirect("/employees");
}
