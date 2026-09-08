"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireShopAdmin } from "@/lib/session";
import { purchaseSchema } from "@/lib/validation";
import { toCents } from "@/lib/money";
import { writeAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "@/lib/constants";
import { fieldErrorsFrom, type FormState } from "./form-state";

function parse(formData: FormData) {
  return purchaseSchema.safeParse({
    employeeId: formData.get("employeeId"),
    date: formData.get("date"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  });
}

export async function createPurchaseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireShopAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const purchase = await prisma.purchase.create({
    data: {
      employeeId: parsed.data.employeeId,
      date: parsed.data.date,
      amount: toCents(parsed.data.amount),
      description: parsed.data.description,
      notes: parsed.data.notes,
      createdById: user.id,
    },
  });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.PURCHASE,
    entityId: purchase.id,
    changes: { ...parsed.data, amount: toCents(parsed.data.amount) },
  });

  revalidatePath("/purchases");
  redirect("/purchases");
}

export async function updatePurchaseAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireShopAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await prisma.purchase.update({
    where: { id },
    data: {
      employeeId: parsed.data.employeeId,
      date: parsed.data.date,
      amount: toCents(parsed.data.amount),
      description: parsed.data.description,
      notes: parsed.data.notes,
    },
  });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.PURCHASE,
    entityId: id,
    changes: { ...parsed.data, amount: toCents(parsed.data.amount) },
  });

  revalidatePath("/purchases");
  redirect("/purchases");
}

export async function deletePurchaseAction(formData: FormData): Promise<void> {
  const user = await requireShopAdmin();
  const id = String(formData.get("id"));
  await prisma.purchase.delete({ where: { id } });
  await writeAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.PURCHASE,
    entityId: id,
  });
  revalidatePath("/purchases");
  redirect("/purchases");
}
