"use client";

import { useEffect, useState } from "react";

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

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/doctor/analytics?range=${range}`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setRange("week")}
          className={`rounded-md px-4 py-2 text-sm ${
            range === "week"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Last Week
        </button>
        <button
          onClick={() => setRange("month")}
          className={`rounded-md px-4 py-2 text-sm ${
            range === "month"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setRange("year")}
          className={`rounded-md px-4 py-2 text-sm ${
            range === "year"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Last Year
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            PKR {analytics.totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            From {analytics.completedAppointments} completed appointments
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Appointments</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {analytics.rangeAppointments}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {analytics.completedAppointments} completed
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {analytics.averageRating.toFixed(1)} ⭐
          </p>
          <p className="mt-1 text-xs text-gray-500">
            From {analytics.totalReviews} reviews
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">No-Show Rate</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {analytics.noShowRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {analytics.noShows} no-shows
          </p>
        </div>
      </div>

      {/* Appointments by Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black">
          Appointments by Status
        </h3>
        <div className="mt-4 grid grid-cols-5 gap-4">
          {Object.entries(analytics.appointmentsByStatus).map(
            ([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="mt-1 text-sm text-gray-600 capitalize">
                  {status.replace("_", " ")}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Appointments Timeline */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black">
          Appointments Over Time
        </h3>
        <div className="mt-4 space-y-2">
          {Object.entries(analytics.appointmentsByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([date, count]) => (
              <div key={date} className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min((count / Math.max(...Object.values(analytics.appointmentsByDay))) * 100, 100)}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black">All-Time Statistics</h3>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {analytics.totalAppointments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="mt-1 text-2xl font-bold text-black">
              {analytics.totalAppointments > 0
                ? (
                    (analytics.completedAppointments /
                      analytics.totalAppointments) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}