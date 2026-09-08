import { BUDGET_CRITICAL_THRESHOLD, BUDGET_WARN_THRESHOLD } from "./constants";

export type BudgetLevel = "ok" | "warning" | "critical" | "exceeded";

export interface BudgetStatus {
  budget: number; // cents
  spent: number; // cents
  remaining: number; // cents (can be negative)
  percent: number; // 0..N rounded to 1 decimal
  level: BudgetLevel;
}

/** Inclusive start / exclusive end of a calendar year. */
export function yearRange(year: number): { start: Date; end: Date } {
  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year + 1, 0, 1, 0, 0, 0, 0),
  };
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function budgetStatus(spent: number, budget: number): BudgetStatus {
  const percent = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  let level: BudgetLevel = "ok";
  if (percent >= 100) level = "exceeded";
  else if (percent >= BUDGET_CRITICAL_THRESHOLD) level = "critical";
  else if (percent >= BUDGET_WARN_THRESHOLD) level = "warning";

  return {
    budget,
    spent,
    remaining: budget - spent,
    percent,
    level,
  };
}

export const BUDGET_LEVEL_LABEL: Record<BudgetLevel, string> = {
  ok: "On track",
  warning: "Approaching limit",
  critical: "Near limit",
  exceeded: "Over budget",
};
