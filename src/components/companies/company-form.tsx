"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field } from "@/components/field";
import type { FormState } from "@/lib/actions/form-state";

interface CompanyValues {
  name?: string;
  address?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
}

export function CompanyForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: CompanyValues;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="border border-[var(--color-danger)]/30 px-3 py-2 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <Field label="Company name" htmlFor="name" error={fe.name}>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact person" htmlFor="contactPerson" error={fe.contactPerson}>
              <Input
                id="contactPerson"
                name="contactPerson"
                defaultValue={defaultValues?.contactPerson ?? ""}
              />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select
                id="status"
                name="status"
                defaultValue={
                  defaultValues?.active === false ? "inactive" : "active"
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" error={fe.email}>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </Field>
            <Field label="Phone" htmlFor="phone" error={fe.phone}>
              <Input
                id="phone"
                name="phone"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </Field>
          </div>
          <Field label="Address" htmlFor="address" error={fe.address}>
            <Input
              id="address"
              name="address"
              defaultValue={defaultValues?.address ?? ""}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <SubmitButton>{submitLabel}</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
