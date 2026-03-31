"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  transactions: number;
}

interface DailyData {
  day: string;
  revenue: number;
  transactions: number;
}

interface DoctorData {
  name: string;
  specialization: string;
  revenue: number;
  count: number;
}

interface SpecData {
  name: string;
  revenue: number;
}

interface Props {
  monthlyData: MonthlyData[];
  dailyData: DailyData[];
  topDoctors: DoctorData[];
  specData: SpecData[];
  currentMonthName: string;
}

const CHART_COLORS = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4",
];

function fmtK(v: unknown) {
  const n = Number(v);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export default function RevenueCharts({
  monthlyData,
  dailyData,
  topDoctors,
  specData,
  currentMonthName,
}: Props) {
  const hasMonthlyRevenue = monthlyData.some((d) => d.revenue > 0);
  const hasDailyRevenue   = dailyData.some((d) => d.revenue > 0);
  const hasDoctors        = topDoctors.length > 0;
  const hasSpecs          = specData.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Row 1: 6-Month Bar + Transaction Line ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 6-month revenue bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Monthly Revenue (Last 6 Months)
          </h2>
          <p className="mb-4 text-xs text-gray-400">PKR — verified Stripe payments</p>
          {hasMonthlyRevenue ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={fmtK}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No revenue data yet" />
          )}
        </div>

        {/* Transaction volume line */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Transaction Volume (Last 6 Months)
          </h2>
          <p className="mb-4 text-xs text-gray-400">Number of successful payments per month</p>
          {hasMonthlyRevenue ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [Number(v ?? 0), "Transactions"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No transaction data yet" />
          )}
        </div>
      </div>

      {/* ── Daily Revenue (current month area chart) ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">
          Daily Revenue — {currentMonthName}
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Day-by-day breakdown of successful payments this month
        </p>
        {hasDailyRevenue ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmtK}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#dailyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label={`No payments recorded in ${currentMonthName} yet`} />
        )}
      </div>

      {/* ── Doctor & Specialization breakdown ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top doctors bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Top Doctors by Revenue
          </h2>
          <p className="mb-4 text-xs text-gray-400">Horizontal revenue comparison</p>
          {hasDoctors ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topDoctors.slice(0, 6).map((d) => ({
                    name: d.name.split(" ").slice(0, 2).join(" "),
                    revenue: d.revenue,
                  }))}
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={fmtK}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {topDoctors.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No doctor data yet" />
          )}
        </div>

        {/* Specialization breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Revenue by Specialization
          </h2>
          <p className="mb-4 text-xs text-gray-400">Total payments by medical specialty</p>
          {hasSpecs ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={specData.map((d) => ({
                    name:
                      d.name.length > 18 ? d.name.slice(0, 16) + "…" : d.name,
                    revenue: d.revenue,
                  }))}
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={fmtK}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {specData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No specialization data yet" />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
