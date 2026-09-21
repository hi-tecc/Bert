"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n/context";

export interface ChartDatum {
  name: string;
  Budget: number;
  Spent: number;
}

export function SpendingChart({ data }: { data: ChartDatum[] }) {
  const { locale, t } = useI18n();
  const currency = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", {
    style: "currency",
    currency: "EUR",
  });
  const formatCurrency = (value: number) => currency.format(value / 100);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-5 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#e6ded4]" /> {t.dashboard.chartBudget}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#1a1a1a]" /> {t.dashboard.chartSpent}
        </span>
      </div>
      <div className="h-72 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a14" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6c6863" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6c6863" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <Tooltip
              cursor={{ fill: "rgba(212,175,55,0.08)" }}
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                borderRadius: 0,
                border: "1px solid #1a1a1a1f",
                background: "#fdfcfa",
                fontSize: 12,
              }}
              itemStyle={{ color: "#1a1a1a" }}
            />
            <Bar dataKey="Budget" name={t.dashboard.chartBudget} fill="#e6ded4" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Spent" name={t.dashboard.chartSpent} fill="#1a1a1a" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{t.dashboard.chartAccessibleCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.common.company}</th>
            <th scope="col">{t.dashboard.chartBudget}</th>
            <th scope="col">{t.dashboard.chartSpent}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <th scope="row">{item.name}</th>
              <td>{formatCurrency(item.Budget)}</td>
              <td>{formatCurrency(item.Spent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
