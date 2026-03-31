"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DoctorEntry {
  name: string;
  spec: string;
  count: number;
}

interface DowEntry {
  name: string;
  count: number;
}

interface Props {
  topDoctors: DoctorEntry[];
  dowData: DowEntry[];
}

const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export default function AnalyticsCharts({ topDoctors, dowData }: Props) {
  const hasDoctors = topDoctors.length > 0;
  const hasDow     = dowData.some((d) => d.count > 0);

  const doctorChartData = topDoctors.map((d) => ({
    name: d.name.split(" ").slice(0, 2).join(" "),
    appointments: d.count,
    spec: d.spec,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top Doctors by Appointment Count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold text-gray-900">Top Doctors</h2>
        <p className="mt-0.5 mb-4 text-xs text-gray-500">By confirmed + completed appointments</p>

        {hasDoctors ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={doctorChartData}
                margin={{ left: 8, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#374151" }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [v, "Appointments"]}
                />
                <Bar dataKey="appointments" radius={[0, 6, 6, 0]}>
                  {doctorChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">No appointment data yet</p>
          </div>
        )}
      </motion.div>

      {/* Day-of-Week Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-base font-semibold text-gray-900">Appointments by Day</h2>
        <p className="mt-0.5 mb-4 text-xs text-gray-500">Which days are most popular</p>

        {hasDow ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dowData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
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
                  formatter={(v) => [v, "Appointments"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {dowData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">No appointment data yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
