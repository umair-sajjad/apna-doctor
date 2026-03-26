"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import ServiceHealthChart from "@/components/admin/ServiceHealthChart";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    activeServers: 0,
    totalAppointments: 0,
    deploymentsToday: 0,
    openIncidents: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [
        { count: totalUsers },
        { count: totalDoctors },
        { count: activeServers },
        { count: totalAppointments },
        { data: todayAppointments },
        { count: openIncidents },
        { data: appointments },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase
          .from("doctors")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("*")
          .gte("appointment_date", new Date().toISOString().split("T")[0]),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "cancelled"),
        supabase
          .from("appointments")
          .select(
            `
            *,
            doctors(full_name),
            users(full_name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalDoctors: totalDoctors || 0,
        activeServers: activeServers || 0,
        totalAppointments: totalAppointments || 0,
        deploymentsToday: todayAppointments?.length || 0,
        openIncidents: openIncidents || 0,
      });

      setRecentActivity(appointments || []);
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back. Here's your platform overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Servers"
          value={`${stats.activeServers}/${stats.totalDoctors}`}
          change="+4%"
          changeType="positive"
          icon="🖥️"
          trend="from last week"
          sparklineColor="green"
          index={0}
        />
        <StatsCard
          title="Deployments Today"
          value={stats.deploymentsToday.toString()}
          change="+22%"
          changeType="positive"
          icon="🚀"
          trend="from yesterday"
          sparklineColor="blue"
          index={1}
        />
        <StatsCard
          title="Open Incidents"
          value={stats.openIncidents.toString()}
          change="-40%"
          changeType="negative"
          icon="⚠️"
          trend="from last week"
          sparklineColor="purple"
          index={2}
        />
        <StatsCard
          title="Avg Response Time"
          value="142ms"
          change="-8%"
          changeType="positive"
          icon="⚡"
          trend="from last hour"
          sparklineColor="orange"
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={[]} />
        </div>
        <div>
          <ServiceHealthChart
            totalDoctors={stats.totalDoctors}
            verifiedDoctors={stats.activeServers}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Deployments
          </h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all →
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Latest deployment activity across services
        </div>

        <div className="space-y-3">
          {recentActivity.slice(0, 8).map((activity) => {
            const now = new Date();
            const created = new Date(activity.created_at);
            const diffMinutes = Math.floor(
              (now.getTime() - created.getTime()) / 60000
            );

            let timeAgo = "";
            if (diffMinutes < 60) {
              timeAgo = `${diffMinutes}m ago`;
            } else if (diffMinutes < 1440) {
              timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;
            } else {
              timeAgo = `${Math.floor(diffMinutes / 1440)}d ago`;
            }

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <span className="text-sm text-green-600">✓</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.users?.full_name || activity.patient_name}
                    </span>{" "}
                    <span className="text-gray-600">
                      booked appointment with Dr. {activity.doctors.full_name}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
                </div>
                <div>
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                      activity.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : activity.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Incidents */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Active Incidents
        </h2>
        <div className="py-8 text-center text-gray-500">
          <p>No ongoing issues</p>
          <p className="mt-2 text-sm">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
