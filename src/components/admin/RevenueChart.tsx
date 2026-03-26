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
} from "recharts";

interface RevenueChartProps {
  data: any[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState("24H");

  // Generate 24 hours of mock data
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    requests: Math.floor(Math.random() * 3000) + 1000,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Request Volume
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Requests per minute over the last 24 hours
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {["1M", "3M", "6M", "1Y", "ALL"].map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                timeRange === range
                  ? "bg-gray-900 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#dc2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
