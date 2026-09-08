import Link from "next/link";
import { format } from "date-fns";
import { Building2, Users, ShoppingCart } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireUser, isShopAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const shopAdmin = isShopAdmin(user);
  const query = (q ?? "").trim();

  const companyScopeId = shopAdmin ? undefined : (user.companyId ?? "__none__");

  const employeeWhere: Prisma.EmployeeWhereInput = {
    ...(companyScopeId ? { companyId: companyScopeId } : {}),
    OR: [
      { firstName: { contains: query } },
      { lastName: { contains: query } },
      { email: { contains: query } },
    ],
  };

  const purchaseWhere: Prisma.PurchaseWhereInput = {
    ...(companyScopeId ? { employee: { companyId: companyScopeId } } : {}),
    description: { contains: query },
  };

  const [companies, employees, purchases] = await Promise.all([
    shopAdmin && query
      ? prisma.company.findMany({
          where: { name: { contains: query } },
          take: 10,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    query
      ? prisma.employee.findMany({
          where: employeeWhere,
          include: { company: { select: { name: true } } },
          take: 10,
        })
      : Promise.resolve([]),
    query
      ? prisma.purchase.findMany({
          where: purchaseWhere,
          include: {
            employee: { include: { company: { select: { name: true } } } },
          },
          take: 10,
          orderBy: { date: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const total = companies.length + employees.length + purchases.length;

  return (
    <div>
      <PageHeader
        title="Search"
        subtitle={query ? `${total} results for “${query}”` : "Enter a search term"}
      />

      {query && total === 0 && (
        <Card>
          <CardContent>
            <p className="py-6 text-center text-sm text-slate-400">
              No results found.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {companies.length > 0 && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <CardTitle>Companies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {companies.map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.contactPerson && (
                    <span className="text-slate-400"> · {c.contactPerson}</span>
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {employees.length > 0 && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {employees.map((e) => (
                <Link
                  key={e.id}
                  href={`/employees/${e.id}`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium">
                    {e.firstName} {e.lastName}
                  </span>
                  <span className="text-slate-400">
                    {" "}
                    · {e.company.name} · {e.email}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {purchases.length > 0 && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-400" />
              <CardTitle>Purchases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {purchases.map((p) => (
                <Link
                  key={p.id}
                  href={`/employees/${p.employeeId}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span>
                    <span className="font-medium">{p.description}</span>
                    <span className="text-slate-400">
                      {" "}
                      · {p.employee.firstName} {p.employee.lastName} ·{" "}
                      {format(p.date, "MMM d, yyyy")}
                    </span>
                  </span>
                  <span className="font-medium">{formatMoney(p.amount)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
