"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/field";

export interface EmployeeOption {
  id: string;
  label: string;
  companyId: string;
}

export function ReportFilters({
  companies,
  employees,
  showCompany,
}: {
  companies: { id: string; name: string }[];
  employees: EmployeeOption[];
  showCompany: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [companyId, setCompanyId] = useState(params.get("companyId") ?? "");
  const [employeeId, setEmployeeId] = useState(params.get("employeeId") ?? "");
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  const visibleEmployees = companyId
    ? employees.filter((e) => e.companyId === companyId)
    : employees;

  function apply() {
    const next = new URLSearchParams();
    if (companyId) next.set("companyId", companyId);
    if (employeeId) next.set("employeeId", employeeId);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    router.push(`/reports?${next.toString()}`);
  }

  function thisYear() {
    const y = new Date().getFullYear();
    setFrom(`${y}-01-01`);
    setTo(`${y}-12-31`);
  }

  function reset() {
    setCompanyId("");
    setEmployeeId("");
    setFrom("");
    setTo("");
    router.push("/reports");
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {showCompany && (
        <Field label="Company">
          <Select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setEmployeeId("");
            }}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Employee">
        <Select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">All employees</option>
          {visibleEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="From">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </Field>
      <Field label="To">
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </Field>

      <div className="flex flex-wrap items-center gap-2 md:col-span-2 lg:col-span-4">
        <Button onClick={apply}>Generate report</Button>
        <Button variant="outline" onClick={thisYear}>
          Current year
        </Button>
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
