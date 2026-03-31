import { createClient } from "@supabase/supabase-js";
import { Users, Stethoscope, Calendar, DollarSign } from "lucide-react";
import ReportsClient from "@/components/admin/ReportsClient";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function fmtPKR(n: number) {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(1)}K`;
  return `PKR ${n}`;
}

export default async function AdminReportsPage() {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const [
    { count: totalUsers },
    { count: totalDoctors },
    { count: totalAppointments },
    { count: thisMonthAppointments },
    { data: revenueRows },
    { data: lastMonthRevRows },
  ] = await Promise.all([
    adminSupabase.from("users").select("*", { count: "exact", head: true }),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }),
    adminSupabase.from("appointments").select("*", { count: "exact", head: true }),
    adminSupabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    adminSupabase.from("payment_transactions").select("amount").eq("status", "succeeded").gte("paid_at", monthStart),
    adminSupabase.from("payment_transactions").select("amount").eq("status", "succeeded").gte("paid_at", lastMStart).lt("paid_at", monthStart),
  ]);

  const thisMonthRevenue = (revenueRows ?? []).reduce((s, r) => s + r.amount, 0);
  const lastMonthRevenue = (lastMonthRevRows ?? []).reduce((s, r) => s + r.amount, 0);
  const revenueGrowthPct = lastMonthRevenue
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : null;

  const kpis = [
    {
      label: "Total Patients",
      value: String(totalUsers ?? 0),
      sub: `This month's appointments: ${thisMonthAppointments ?? 0}`,
      Icon: Users,
      gradient: "from-blue-500 to-blue-600",
      iconColor: "text-blue-100",
    },
    {
      label: "Total Doctors",
      value: String(totalDoctors ?? 0),
      sub: "Registered on platform",
      Icon: Stethoscope,
      gradient: "from-purple-500 to-purple-600",
      iconColor: "text-purple-100",
    },
    {
      label: "Total Appointments",
      value: String(totalAppointments ?? 0),
      sub: `${thisMonthAppointments ?? 0} this month`,
      Icon: Calendar,
      gradient: "from-orange-500 to-orange-600",
      iconColor: "text-orange-100",
    },
    {
      label: "This Month Revenue",
      value: fmtPKR(thisMonthRevenue),
      sub: revenueGrowthPct !== null
        ? `${revenueGrowthPct >= 0 ? "+" : ""}${revenueGrowthPct.toFixed(0)}% vs last month`
        : "No prior month data",
      Icon: DollarSign,
      gradient: "from-green-500 to-green-600",
      iconColor: "text-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Export platform data as CSV — patients, revenue, appointments, doctors, and payments
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`rounded-xl bg-gradient-to-br ${k.gradient} p-5 text-white`}
          >
            <div className="mb-3 flex items-start justify-between">
              <k.Icon className={`h-7 w-7 ${k.iconColor}`} />
            </div>
            <p className="text-sm text-white/70">{k.label}</p>
            <p className="mt-0.5 text-2xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-white/60">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Client section: report cards + custom builder */}
      <ReportsClient />
    </div>
  );
}
