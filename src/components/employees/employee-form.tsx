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

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          {lockedCompanyId ? (
            <input type="hidden" name="companyId" value={lockedCompanyId} />
          ) : (
            <Field label="Company" htmlFor="companyId" error={fe.companyId}>
              <Select
                id="companyId"
                name="companyId"
                defaultValue={defaultValues?.companyId ?? ""}
                required
              >
                <option value="" disabled>
                  Select a company
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
            <Field label="First name" htmlFor="firstName" error={fe.firstName}>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={defaultValues?.firstName ?? ""}
                required
              />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={defaultValues?.lastName ?? ""}
                required
              />
            </Field>
          </div>

          <Field label="Email" htmlFor="email" error={fe.email}>
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
              label="Annual budget (EUR)"
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
