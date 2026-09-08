"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireShopAdmin } from "@/lib/session";
import { companySchema } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "@/lib/constants";
import { fieldErrorsFrom, type FormState } from "./form-state";

function parse(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    active: formData.get("status") === "active",
  });
}

export async function createCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireShopAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const company = await prisma.company.create({ data: parsed.data });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.COMPANY,
    entityId: company.id,
    changes: parsed.data,
  });

  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompanyAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireShopAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await prisma.company.update({ where: { id }, data: parsed.data });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.COMPANY,
    entityId: id,
    changes: parsed.data,
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompanyAction(formData: FormData): Promise<void> {
  const user = await requireShopAdmin();
  const id = String(formData.get("id"));
  await prisma.company.delete({ where: { id } });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.COMPANY,
    entityId: id,
  });
  revalidatePath("/companies");
  redirect("/companies");
}

export async function toggleCompanyActiveAction(
  formData: FormData,
): Promise<void> {
  const user = await requireShopAdmin();
  const id = String(formData.get("id"));
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return;

  await prisma.company.update({
    where: { id },
    data: { active: !company.active },
  });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.COMPANY,
    entityId: id,
    changes: { active: !company.active },
  });
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}
