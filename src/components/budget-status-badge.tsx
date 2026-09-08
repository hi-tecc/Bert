import { Badge } from "@/components/ui/badge";
import { BUDGET_LEVEL_LABEL, type BudgetLevel } from "@/lib/budget";

const tone: Record<BudgetLevel, "success" | "warning" | "danger"> = {
  ok: "success",
  warning: "warning",
  critical: "warning",
  exceeded: "danger",
};

export function BudgetStatusBadge({
  level,
  percent,
}: {
  level: BudgetLevel;
  percent?: number;
}) {
  return (
    <Badge tone={tone[level]}>
      {BUDGET_LEVEL_LABEL[level]}
      {percent !== undefined ? ` · ${percent}%` : ""}
    </Badge>
  );
}
