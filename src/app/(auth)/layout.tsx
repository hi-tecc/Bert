export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-none bg-[var(--color-foreground)] font-serif text-xl text-[var(--color-primary-foreground)] shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            B
          </div>
          <div className="mx-auto mb-4 h-px w-8 bg-[var(--color-accent)]" />
          <h1 className="font-serif text-3xl tracking-tight text-[var(--color-foreground)]">
            Budget Tracker
          </h1>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Company Spending Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
