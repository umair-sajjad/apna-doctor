"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  CalendarDays,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

interface Analytics {
  totalAppointments: number;
  completedAppointments: number;
  rangeAppointments: number;
  totalRevenue: number;
  noShows: number;
  noShowRate: number;
  averageRating: number;
  totalReviews: number;
  appointmentsByDay: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
}

const RANGES = [
  { key: "week", label: "Last Week" },
  { key: "month", label: "Last Month" },
  { key: "year", label: "Last Year" },
] as const;

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctor/analytics?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.analytics) setAnalytics(data.analytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-4 py-16">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-12 w-12 animate-spin rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--accent)",
              borderRightColor: "var(--accent)",
            }}
          />
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <TrendingUp size={14} className="text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-400">Loading analytics…</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <AlertCircle size={24} className="mb-2 text-red-400" />
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-dark)" }}
        >
          Failed to load analytics
        </p>
        <button
          onClick={() => setRange(range)}
          className="mt-3 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          Try again
        </button>
      </div>
    );
  }

  const maxDay = Math.max(...Object.values(analytics.appointmentsByDay), 1);

  const statCards = [
    {
      label: "Total Revenue",
      value: `PKR ${analytics.totalRevenue.toLocaleString()}`,
      sub: `${analytics.completedAppointments} completed`,
      icon: TrendingUp,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      label: "Appointments",
      value: String(analytics.rangeAppointments),
      sub: `${analytics.completedAppointments} completed`,
      icon: CalendarDays,
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      label: "Average Rating",
      value: analytics.averageRating.toFixed(1),
      sub: `${analytics.totalReviews} reviews`,
      icon: Star,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "No-Show Rate",
      value: `${analytics.noShowRate.toFixed(1)}%`,
      sub: `${analytics.noShows} no-shows`,
      icon: AlertCircle,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ];

  const STATUS_META: Record<string, { color: string; icon: any }> = {
    completed: { color: "#059669", icon: CheckCircle2 },
    confirmed: { color: "var(--primary)", icon: Clock },
    pending: { color: "#d97706", icon: Clock },
    cancelled: { color: "#dc2626", icon: XCircle },
    no_show: { color: "#6b7280", icon: AlertCircle },
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Range selector */}
      <div
        className="inline-flex rounded-xl p-1"
        style={{
          background: "white",
          border: "1px solid var(--primary-light)",
        }}
      >
        {RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={
              range === key
                ? {
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                    color: "white",
                  }
                : { color: "rgba(0,0,0,0.45)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="absolute top-0 right-0 left-0 h-0.5 rounded-t-2xl"
              style={{ background: card.color }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">{card.label}</p>
                <p
                  className="font-display mt-2 text-2xl font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: card.bg }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div
        className="rounded-2xl bg-white p-6"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={15} style={{ color: "var(--primary)" }} />
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Appointments by Status
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(analytics.appointmentsByStatus).map(
            ([status, count]) => {
              const meta = STATUS_META[status] ?? {
                color: "var(--primary)",
                icon: CalendarDays,
              };
              return (
                <div
                  key={status}
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <meta.icon
                    size={16}
                    className="mx-auto mb-2"
                    style={{ color: meta.color }}
                  />
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color: meta.color }}
                  >
                    {count}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 capitalize">
                    {status.replace("_", " ")}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Timeline bar chart */}
      <div
        className="rounded-2xl bg-white p-6"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp size={15} style={{ color: "var(--primary)" }} />
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Appointments Over Time
          </p>
        </div>
        <div className="space-y-2.5">
          {Object.entries(analytics.appointmentsByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([date, count]) => (
              <div key={date} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-gray-400">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div
                  className="flex-1 overflow-hidden rounded-full"
                  style={{ background: "var(--primary-light)", height: "10px" }}
                >
                  <div
                    className="flex h-full items-center justify-end rounded-full pr-1.5 transition-all duration-500"
                    style={{
                      width: `${Math.min((count / maxDay) * 100, 100)}%`,
                      background:
                        "linear-gradient(90deg, var(--primary), var(--accent))",
                      minWidth: count > 0 ? "20px" : "0",
                    }}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* All-time stats */}
      <div
        className="rounded-2xl bg-white p-6"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div className="mb-5 flex items-center gap-2">
          <Star size={15} style={{ color: "var(--primary)" }} />
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            All-Time Statistics
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Appointments", value: analytics.totalAppointments },
            {
              label: "Completion Rate",
              value: `${analytics.totalAppointments > 0 ? ((analytics.completedAppointments / analytics.totalAppointments) * 100).toFixed(1) : 0}%`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <p className="text-xs text-gray-400">{item.label}</p>
              <p
                className="font-display mt-2 text-3xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
