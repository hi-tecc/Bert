"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface ActionState {
  error?: string;
  success?: string;
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  const genericSuccess = {
    success: "If that email exists, a reset link has been generated.",
  };
  if (!parsed.success) return genericSuccess;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // No SMTP in local dev: log the reset link to the server console.
    console.log(
      `\n[password-reset] Link for ${user.email}: /reset-password?token=${token}\n`,
    );
  }

  return genericSuccess;
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: parsed.data.token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return { success: "Password updated. You can now sign in." };
}
