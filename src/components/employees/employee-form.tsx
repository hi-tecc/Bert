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

interface EmployeeValues {
  companyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  annualBudgetDollars?: number;
  active?: boolean;
}

export function EmployeeForm({
  action,
  companies,
  lockedCompanyId,
  defaultValues,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  companies: { id: string; name: string }[];
  lockedCompanyId?: string;
  defaultValues?: EmployeeValues;
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

          {lockedCompanyId ? (
            <input type="hidden" name="companyId" value={lockedCompanyId} />
          ) : (
            <Field label={t.common.company} htmlFor="companyId" error={fe.companyId}>
              <Select
                id="companyId"
                name="companyId"
                defaultValue={defaultValues?.companyId ?? ""}
                required
              >
                <option value="" disabled>
                  {t.common.selectCompany}
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.employees.formFirstName} htmlFor="firstName" error={fe.firstName}>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={defaultValues?.firstName ?? ""}
                required
              />
            </Field>
            <Field label={t.employees.formLastName} htmlFor="lastName" error={fe.lastName}>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={defaultValues?.lastName ?? ""}
                required
              />
            </Field>
          </div>

          <Field label={t.common.email} htmlFor="email" error={fe.email}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultValues?.email ?? ""}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t.employees.formAnnualBudget}
              htmlFor="annualBudget"
              error={fe.annualBudget}
            >
              <Input
                id="annualBudget"
                name="annualBudget"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultValues?.annualBudgetDollars ?? ""}
                required
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
