import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MobileCard, MobileCardRow } from "@/components/ui/mobile-card";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { getT } from "@/lib/i18n/server";

export interface RecentPurchaseRow {
  id: string;
  date: Date;
  amount: number;
  description: string;
  employeeName: string;
  companyName?: string;
}

export async function RecentPurchases({
  rows,
  showCompany = false,
}: {
  rows: RecentPurchaseRow[];
  showCompany?: boolean;
}) {
  const t = await getT();
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle emphasizeLast>{t.dashboard.recentPurchases}</CardTitle>
        <Link
          href="/purchases"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          {t.dashboard.viewAll}
        </Link>
      </CardHeader>
      <CardContent className="pt-3">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            {t.dashboard.noPurchasesYet}
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <THead>
                  <TR>
                    <TH>{t.common.date}</TH>
                    <TH>{t.common.description}</TH>
                    <TH>{t.common.employee}</TH>
                    {showCompany && <TH>{t.common.company}</TH>}
                    <TH className="text-right">{t.common.amount}</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.id}>
                      <TD className="whitespace-nowrap text-slate-500">
                        {formatDate(r.date)}
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
                  <MobileCardRow label={t.common.date}>
                    {formatDate(r.date)}
                  </MobileCardRow>
                  <MobileCardRow label={t.common.employee}>{r.employeeName}</MobileCardRow>
                  {showCompany && r.companyName && (
                    <MobileCardRow label={t.common.company}>{r.companyName}</MobileCardRow>
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
