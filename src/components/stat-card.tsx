import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</p>
          <p className="mt-2 font-serif text-3xl text-[var(--color-foreground)]">{value}</p>
          {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[var(--color-muted-bg)] text-[var(--color-foreground)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
