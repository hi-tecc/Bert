import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { getT } from "@/lib/i18n/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const t = await getT();

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 bg-[var(--color-foreground)] px-4 py-3 text-sm font-medium text-[var(--color-primary-foreground)] transition-transform duration-200 focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.name} role={user.role} />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
