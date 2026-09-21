"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field } from "@/components/field";
import { FormError, useFocusFirstError } from "@/components/form-error";
import { ROLES } from "@/lib/constants";
import type { FormState } from "@/lib/actions/form-state";
import { useI18n } from "@/lib/i18n/context";

interface UserValues {
  name?: string;
  email?: string;
  role?: string;
  companyId?: string | null;
}

export function UserForm({
  action,
  companies,
  defaultValues,
  submitLabel,
  isEdit = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  companies: { id: string; name: string }[];
  defaultValues?: UserValues;
  submitLabel: string;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};
  const [role, setRole] = useState(defaultValues?.role ?? ROLES.COMPANY_ADMIN);
  const { t } = useI18n();
  useFocusFirstError(fe);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />
          <Field label={t.users.formFullName} htmlFor="name" error={fe.name}>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              required
            />
          </Field>
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
            <Field label={t.common.role} htmlFor="role" error={fe.role}>
              <Select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value={ROLES.COMPANY_ADMIN}>{t.roles.companyAdmin}</option>
                <option value={ROLES.SHOP_ADMIN}>{t.roles.shopAdmin}</option>
              </Select>
            </Field>
            {role === ROLES.COMPANY_ADMIN && (
              <Field label={t.common.company} htmlFor="companyId" error={fe.companyId}>
                <Select
                  id="companyId"
                  name="companyId"
                  defaultValue={defaultValues?.companyId ?? ""}
                >
                  <option value="">{t.common.selectCompanyEllipsis}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          <Field
            label={isEdit ? t.users.formNewPassword : t.users.formPassword}
            htmlFor="password"
            error={fe.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={
                isEdit ? t.users.formKeepPassword : undefined
              }
              required={!isEdit}
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
