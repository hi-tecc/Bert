import { cn } from "@/lib/utils";
import type { BudgetLevel } from "@/lib/budget";

const levelColor: Record<BudgetLevel, string> = {
  ok: "bg-green-500",
  warning: "bg-amber-500",
  critical: "bg-orange-500",
  exceeded: "bg-red-500",
};

export function BudgetBar({
  percent,
  level,
  className,
}: {
  percent: number;
  level: BudgetLevel;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-slate-200",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", levelColor[level])}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}
