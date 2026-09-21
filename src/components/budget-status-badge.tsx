import { Badge } from "@/components/ui/badge";
import type { BudgetLevel } from "@/lib/budget";
import { getT } from "@/lib/i18n/server";

const tone: Record<BudgetLevel, "success" | "warning" | "danger"> = {
  ok: "success",
  warning: "warning",
  critical: "warning",
  exceeded: "danger",
};

export async function BudgetStatusBadge({
  level,
  percent,
}: {
  level: BudgetLevel;
  percent?: number;
}) {
  const t = await getT();
  return (
    <Badge tone={tone[level]}>
      {t.budgetLevels[level]}
      {percent !== undefined ? ` · ${percent}%` : ""}
    </Badge>
  );
}
