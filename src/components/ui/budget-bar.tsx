import { cn } from "@/lib/utils";
import type { BudgetLevel } from "@/lib/budget";

const levelColor: Record<BudgetLevel, string> = {
  ok: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  critical: "bg-[#c05621]",
  exceeded: "bg-[var(--color-danger)]",
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
        "h-1.5 w-full overflow-hidden rounded-none bg-[var(--color-muted-bg)]",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-none transition-all duration-700", levelColor[level])}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}
