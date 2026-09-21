"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field } from "@/components/field";
import { FormError, useFocusFirstError } from "@/components/form-error";
import type { FormState } from "@/lib/actions/form-state";
import { useI18n } from "@/lib/i18n/context";

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
  const { t } = useI18n();
  useFocusFirstError(fe);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />
          <Field label={t.companies.formName} htmlFor="name" error={fe.name}>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.companies.formContactPerson} htmlFor="contactPerson" error={fe.contactPerson}>
              <Input
                id="contactPerson"
                name="contactPerson"
                defaultValue={defaultValues?.contactPerson ?? ""}
              />
            </Field>
            <Field label={t.common.status} htmlFor="status">
              <Select
                id="status"
                name="status"
                defaultValue={
                  defaultValues?.active === false ? "inactive" : "active"
                }
              >
                <option value="active">{t.common.active}</option>
                <option value="inactive">{t.common.inactive}</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.common.email} htmlFor="email" error={fe.email}>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </Field>
            <Field label={t.common.phone} htmlFor="phone" error={fe.phone}>
              <Input
                id="phone"
                name="phone"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </Field>
          </div>
          <Field label={t.common.address} htmlFor="address" error={fe.address}>
            <Input
              id="address"
              name="address"
              defaultValue={defaultValues?.address ?? ""}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t.common.cancel}
            </Button>
            <SubmitButton>{submitLabel}</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
