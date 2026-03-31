"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface DataPoint {
  label: string;
  revenue: number;
  transactions: number;
}

interface RevenueChartProps {
  data: DataPoint[];
}

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

function fmtK(v: unknown) {
  const n = Number(v);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

type Range = "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function RevenueChart({ data }: RevenueChartProps) {
  const [range, setRange] = useState<Range>("6M");
  const [view, setView] = useState<"revenue" | "transactions">("revenue");

  const sliceMap: Record<Range, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    ALL:  data.length,
  };

  const sliced = data.slice(-sliceMap[range]);
  const hasData = sliced.some((d) => d.revenue > 0 || d.transactions > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Monthly revenue and transaction volume
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {(["revenue", "transactions"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v === "revenue" ? "Revenue" : "Transactions"}
              </button>
            ))}
          </div>

          {/* Time range */}
          <div className="flex gap-1">
            {(["1M", "3M", "6M", "1Y", "ALL"] as Range[]).map((r) => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRange(r)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  range === r
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {r}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {view === "revenue" ? (
              <AreaChart data={sliced}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmtK}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={sliced} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [Number(v ?? 0), "Transactions"]}
                />
                <Bar dataKey="transactions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">No data available for this range</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
