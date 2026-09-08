import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.name} role={user.role} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
