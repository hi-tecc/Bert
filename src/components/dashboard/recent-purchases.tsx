import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { formatMoney } from "@/lib/money";

export interface RecentPurchaseRow {
  id: string;
  date: Date;
  amount: number;
  description: string;
  employeeName: string;
  companyName?: string;
}

export function RecentPurchases({
  rows,
  showCompany = false,
}: {
  rows: RecentPurchaseRow[];
  showCompany?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle emphasizeLast>Recent purchases</CardTitle>
        <Link
          href="/purchases"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pt-3">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No purchases yet.
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <THead>
                  <TR>
                    <TH>Date</TH>
                    <TH>Description</TH>
                    <TH>Employee</TH>
                    {showCompany && <TH>Company</TH>}
                    <TH className="text-right">Amount</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.id}>
                      <TD className="whitespace-nowrap text-slate-500">
                        {format(r.date, "MMM d, yyyy")}
                      </TD>
                      <TD className="font-medium">{r.description}</TD>
                      <TD className="text-slate-600">{r.employeeName}</TD>
                      {showCompany && (
                        <TD className="text-slate-600">{r.companyName}</TD>
                      )}
                      <TD className="text-right font-medium">
                        {formatMoney(r.amount)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {rows.map((r) => (
                <MobileCard key={r.id}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-medium">{r.description}</span>
                    <span className="font-medium">{formatMoney(r.amount)}</span>
                  </div>
                  <MobileCardRow label="Date">
                    {format(r.date, "MMM d, yyyy")}
                  </MobileCardRow>
                  <MobileCardRow label="Employee">{r.employeeName}</MobileCardRow>
                  {showCompany && r.companyName && (
                    <MobileCardRow label="Company">{r.companyName}</MobileCardRow>
                  )}
                </MobileCard>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
