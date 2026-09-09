"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field } from "@/components/field";
import type { FormState } from "@/lib/actions/form-state";

interface PurchaseValues {
  employeeId?: string;
  date?: string; // yyyy-MM-dd
  amountDollars?: number;
  description?: string;
  notes?: string | null;
}

export function PurchaseForm({
  action,
  employees,
  defaultValues,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  employees: { id: string; label: string }[];
  defaultValues?: PurchaseValues;
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

          <Field label="Employee" htmlFor="employeeId" error={fe.employeeId}>
            <Select
              id="employeeId"
              name="employeeId"
              defaultValue={defaultValues?.employeeId ?? ""}
              required
            >
              <option value="" disabled>
                Select an employee
              </option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="date" error={fe.date}>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultValues?.date ?? ""}
                required
              />
            </Field>
            <Field label="Amount (EUR)" htmlFor="amount" error={fe.amount}>
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

          <Field label="Description" htmlFor="description" error={fe.description}>
            <Input
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              required
            />
          </Field>

          <Field label="Notes (optional)" htmlFor="notes" error={fe.notes}>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={defaultValues?.notes ?? ""}
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
