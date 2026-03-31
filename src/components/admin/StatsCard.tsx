"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
  trend: string;
  sparklineColor: string;
  sparklineData?: number[];
  index?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  trend,
  sparklineColor,
  sparklineData,
  index = 0,
}: StatsCardProps) {
  const changeColor =
    changeType === "positive" ? "text-green-600" : "text-red-600";
  const ChangeIcon = changeType === "positive" ? ArrowUp : ArrowDown;

  const sparklineColors: Record<string, string> = {
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#a855f7",
    orange: "#f59e0b",
  };

  const data = (sparklineData && sparklineData.length > 0
    ? sparklineData
    : Array.from({ length: 10 }, () => Math.random() * 100 + 20)
  ).map((v) => ({ value: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-shadow"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm text-gray-600">{title}</p>
          <motion.h3
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            className="text-3xl font-bold text-gray-900"
          >
            {value}
          </motion.h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="text-4xl"
        >
          {icon}
        </motion.div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}
          >
            <ChangeIcon className="h-4 w-4" />
            {change}
          </span>
          <span className="text-xs text-gray-500">{trend}</span>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="-mb-2 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={sparklineColors[sparklineColor]}
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
