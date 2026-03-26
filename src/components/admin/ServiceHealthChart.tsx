"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ServiceHealthChartProps {
  totalDoctors: number;
  verifiedDoctors: number;
}

export default function ServiceHealthChart({
  totalDoctors,
  verifiedDoctors,
}: ServiceHealthChartProps) {
  const healthyCount = verifiedDoctors;
  const degradedCount = Math.floor(totalDoctors * 0.1); // 10% degraded
  const downCount = totalDoctors - healthyCount - degradedCount;

  const data = [
    { name: "Healthy", value: healthyCount, color: "#22c55e" },
    { name: "Degraded", value: degradedCount, color: "#f59e0b" },
    { name: "Down", value: downCount, color: "#ef4444" },
  ];

  const healthyPercentage =
    Math.round((healthyCount / totalDoctors) * 100) || 0;
  const degradedPercentage =
    Math.round((degradedCount / totalDoctors) * 100) || 0;
  const downPercentage = Math.round((downCount / totalDoctors) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Service Health
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Current status across all microservices
      </p>

      {/* Donut Chart */}
      <div className="relative mb-6 flex items-center justify-center">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="text-3xl font-bold text-gray-900">{totalDoctors}</div>
          <div className="text-sm text-gray-600">Services</div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {[
          {
            label: "Healthy",
            count: healthyCount,
            percentage: healthyPercentage,
            color: "bg-green-500",
          },
          {
            label: "Degraded",
            count: degradedCount,
            percentage: degradedPercentage,
            color: "bg-orange-500",
          },
          {
            label: "Down",
            count: downCount,
            percentage: downPercentage,
            color: "bg-red-500",
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`h-3 w-3 ${item.color} rounded-full`}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {item.count}
              </div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
