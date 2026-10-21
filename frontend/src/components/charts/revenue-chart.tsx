"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenuePoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({
  data,
  height = 260,
  showCommission = false,
}: {
  data: RevenuePoint[];
  height?: number;
  showCommission?: boolean;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#123c32" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#123c32" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="commissionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef5b3f" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#ef5b3f" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-muted-foreground"
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-muted-foreground"
            tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: "#d8fb74", strokeWidth: 1 }}
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(120,120,120,0.2)",
              background: "var(--card)",
              color: "var(--card-foreground)",
              fontSize: 11,
              padding: "8px 10px",
            }}
          />
          {showCommission && (
            <Area
              type="monotone"
              dataKey="commission"
              stroke="#ef5b3f"
              strokeWidth={1.5}
              fill="url(#commissionFill)"
              name="Commission"
            />
          )}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#123c32"
            strokeWidth={2}
            fill="url(#revenueFill)"
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
