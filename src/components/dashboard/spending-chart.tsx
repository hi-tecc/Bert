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

export interface ChartDatum {
  name: string;
  Budget: number;
  Spent: number;
}

export function SpendingChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-5 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#e6ded4]" /> Budget
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#1a1a1a]" /> Spent
        </span>
      </div>
      <div className="h-72 w-full">
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
              tickFormatter={(v) => `€${(v / 100).toLocaleString()}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(212,175,55,0.08)" }}
              formatter={(value) => `€${(Number(value) / 100).toLocaleString()}`}
              contentStyle={{
                borderRadius: 0,
                border: "1px solid #1a1a1a1f",
                background: "#fdfcfa",
                fontSize: 12,
              }}
            />
            <Bar dataKey="Budget" fill="#e6ded4" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Spent" fill="#1a1a1a" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
