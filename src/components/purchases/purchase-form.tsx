"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field } from "@/components/field";
import { FormError, useFocusFirstError } from "@/components/form-error";
import type { FormState } from "@/lib/actions/form-state";
import { useI18n } from "@/lib/i18n/context";

interface PurchaseValues {
  employeeId?: string;
  date?: string; // yyyy-MM-dd
  amountDollars?: number;
  description?: string;
  notes?: string | null;
}

export function PurchaseForm({
  action,
  companies,
  employees,
  defaultValues,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  companies: { id: string; label: string }[];
  employees: { id: string; companyId: string; label: string }[];
  defaultValues?: PurchaseValues;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};
  const { t } = useI18n();

  const initialEmployee = employees.find((e) => e.id === defaultValues?.employeeId);
  const [companyId, setCompanyId] = useState(initialEmployee?.companyId ?? "");
  const [employeeId, setEmployeeId] = useState(defaultValues?.employeeId ?? "");

  const filteredEmployees = useMemo(
    () => employees.filter((e) => e.companyId === companyId),
    [employees, companyId],
  );
  useFocusFirstError(fe);

  function handleCompanyChange(value: string) {
    setCompanyId(value);
    const stillValid = employees.some((e) => e.id === employeeId && e.companyId === value);
    if (!stillValid) {
      setEmployeeId("");
    }
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />

          <Field label={t.common.company} htmlFor="companyId" error={fe.companyId}>
            <Combobox
              id="companyId"
              options={companies}
              value={companyId}
              onChange={handleCompanyChange}
              placeholder={t.purchases.formSearchCompany}
              required
            />
          </Field>

          <Field label={t.common.employee} htmlFor="employeeId" error={fe.employeeId}>
            <Combobox
              id="employeeId"
              name="employeeId"
              options={filteredEmployees}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder={companyId ? t.purchases.formSearchEmployee : t.purchases.formSelectCompanyFirst}
              emptyMessage={t.purchases.formNoEmployeesForCompany}
              disabled={!companyId}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.common.date} htmlFor="date" error={fe.date}>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultValues?.date ?? ""}
                required
              />
            </Field>
            <Field label={t.purchases.formAmount} htmlFor="amount" error={fe.amount}>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultValues?.amountDollars ?? ""}
                required
              />
            </Field>
          </div>

          <Field label={t.common.description} htmlFor="description" error={fe.description}>
            <Input
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              required
            />
          </Field>

          <Field label={t.purchases.formNotesOptional} htmlFor="notes" error={fe.notes}>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={defaultValues?.notes ?? ""}
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
