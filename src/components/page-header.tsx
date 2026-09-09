import { emphasizeLastWord } from "@/components/ui/emphasize";

export function PageHeader({
  title,
  subtitle,
  action,
  emphasizeLast = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  emphasizeLast?: boolean;
}) {
  const heading =
    emphasizeLast && typeof title === "string" ? emphasizeLastWord(title) : title;

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{heading}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
