"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireShopAdmin } from "@/lib/session";
import { userCreateSchema, userUpdateSchema } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, ENTITY_TYPES, ROLES } from "@/lib/constants";
import { fieldErrorsFrom, type FormState } from "./form-state";

/** Company admins are tied to a company; shop admins never are. */
function resolveCompanyId(role: string, companyId: string | null): string | null {
  return role === ROLES.COMPANY_ADMIN ? companyId : null;
}

export async function createUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireShopAdmin();
  const parsed = userCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    companyId: formData.get("companyId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "That email is already in use" } };
  }

  const companyId = resolveCompanyId(parsed.data.role, parsed.data.companyId);
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      companyId,
      passwordHash,
    },
  });
  await writeAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.USER,
    entityId: user.id,
    changes: { name: user.name, email, role: user.role, companyId },
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUserAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireShopAdmin();
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { error: "User not found." };

  const parsed = userUpdateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    companyId: formData.get("companyId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();
  const clash = await prisma.user.findUnique({ where: { email } });
  if (clash && clash.id !== id) {
    return { fieldErrors: { email: "That email is already in use" } };
  }

  const companyId = resolveCompanyId(parsed.data.role, parsed.data.companyId);
  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      companyId,
      ...(parsed.data.password
        ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) }
        : {}),
    },
  });
  await writeAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.USER,
    entityId: id,
    changes: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      companyId,
      passwordChanged: Boolean(parsed.data.password),
    },
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const actor = await requireShopAdmin();
  const id = String(formData.get("id"));
  if (id === actor.id) return; // never delete your own account

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.user.delete({ where: { id } });
  await writeAudit({
    userId: actor.id,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.USER,
    entityId: id,
  });
  revalidatePath("/users");
  redirect("/users");
}
