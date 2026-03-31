"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  noShow: number;
  avgRating: string;
  totalReviews: number;
}

const SEGMENTS = [
  { key: "completed", label: "Completed", color: "#3b82f6" },
  { key: "confirmed", label: "Confirmed",  color: "#22c55e" },
  { key: "pending",   label: "Pending",    color: "#f59e0b" },
  { key: "cancelled", label: "Cancelled",  color: "#ef4444" },
  { key: "noShow",    label: "No-Show",    color: "#9ca3af" },
];

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export default function AppointmentStatusChart({
  completed,
  confirmed,
  pending,
  cancelled,
  noShow,
  avgRating,
  totalReviews,
}: Props) {
  const values: Record<string, number> = { completed, confirmed, pending, cancelled, noShow };
  const total = completed + confirmed + pending + cancelled + noShow;

  const data = SEGMENTS.map((s) => ({ name: s.label, value: values[s.key], color: s.color })).filter(
    (d) => d.value > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-gray-900">Appointment Status</h2>
      <p className="mt-0.5 text-xs text-gray-500">Distribution across all time</p>

      {total > 0 ? (
        <>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 space-y-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {d.value} ({Math.round((d.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex h-44 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-400">No appointment data yet</p>
        </div>
      )}

      {/* Rating strip */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2.5">
        <div>
          <p className="text-xs text-gray-500">Avg Patient Rating</p>
          <p className="text-lg font-bold text-yellow-600">{avgRating} ★</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Reviews</p>
          <p className="text-lg font-bold text-gray-800">{totalReviews}</p>
        </div>
      </div>
    </motion.div>
  );
}
