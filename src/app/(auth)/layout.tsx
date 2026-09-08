export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-lg font-bold text-white">
            B
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Budget Tracker</h1>
          <p className="text-sm text-slate-500">Company spending management</p>
        </div>
        {children}
      </div>
    </div>
  );
}
