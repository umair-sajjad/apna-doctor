import { createClient } from "@supabase/supabase-js";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import AppointmentStatusChart from "@/components/admin/AppointmentStatusChart";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminAnalyticsPage() {
  const now        = new Date();
  const today      = now.toISOString().split("T")[0];
  const weekAgo    = new Date(now.getTime() - 7  * 86400000).toISOString();
  const twoWksAgo  = new Date(now.getTime() - 14 * 86400000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMEnd   = monthStart;

  // ── All queries in parallel ───────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: usersThisWeek },
    { count: usersLastWeek },
    { count: totalDoctors },
    { count: verifiedDoctors },
    { count: pendingDoctors },
    { count: doctorsThisMonth },
    { data: allAppointments },
    { data: apptThisWeek },
    { data: apptLastWeek },
    { data: revenueRows },
    { data: reviewRows },
    { data: recentAppointments },
    { data: topDoctorsRaw },
  ] = await Promise.all([
    adminSupabase.from("users").select("*", { count: "exact", head: true }),
    adminSupabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    adminSupabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", twoWksAgo).lt("created_at", weekAgo),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }).eq("is_verified", true),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }).eq("is_verified", false),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }).gte("created_at", monthStart),

    // All appointments (status + date) for status breakdown & day-of-week
    adminSupabase.from("appointments").select("id, status, appointment_date, created_at"),

    // This week & last week for appointment growth
    adminSupabase.from("appointments").select("id").gte("created_at", weekAgo),
    adminSupabase.from("appointments").select("id").gte("created_at", twoWksAgo).lt("created_at", weekAgo),

    // Revenue from payment_transactions
    adminSupabase.from("payment_transactions").select("amount, paid_at").eq("status", "succeeded"),

    // Reviews
    adminSupabase.from("reviews").select("rating").eq("is_visible", true),

    // Recent appointments for activity feed
    adminSupabase
      .from("appointments")
      .select("id, status, created_at, patient_name, appointment_date, appointment_time, doctors(full_name), users(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),

    // Top doctors by appointment count
    adminSupabase
      .from("appointments")
      .select("doctor_id, doctors(full_name, specialization)")
      .in("status", ["confirmed", "completed"]),
  ]);

  // ── Appointment status breakdown ──────────────────────────────────────────
  const apptByStatus: Record<string, number> = {};
  for (const a of allAppointments ?? []) {
    apptByStatus[a.status] = (apptByStatus[a.status] ?? 0) + 1;
  }
  const totalAppointments = allAppointments?.length ?? 0;
  const completedCount    = apptByStatus["completed"] ?? 0;
  const confirmedCount    = apptByStatus["confirmed"] ?? 0;
  const cancelledCount    = apptByStatus["cancelled"] ?? 0;
  const pendingCount      = apptByStatus["pending"]   ?? 0;
  const noShowCount       = apptByStatus["no_show"]   ?? 0;

  const completionRate =
    totalAppointments > 0
      ? Math.round((completedCount / totalAppointments) * 100)
      : 0;

  // ── Revenue ───────────────────────────────────────────────────────────────
  const totalRevenue = (revenueRows ?? []).reduce((s, r) => s + r.amount, 0);
  const thisMonthRevenue = (revenueRows ?? [])
    .filter((r) => r.paid_at && r.paid_at >= monthStart)
    .reduce((s, r) => s + r.amount, 0);
  const lastMonthRevenue = (revenueRows ?? [])
    .filter((r) => r.paid_at && r.paid_at >= lastMStart && r.paid_at < lastMEnd)
    .reduce((s, r) => s + r.amount, 0);
  const revenueGrowth = lastMonthRevenue
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : null;

  // ── 6-month data for RevenueChart ─────────────────────────────────────────
  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const slice = (revenueRows ?? []).filter((r) => {
      if (!r.paid_at) return false;
      const pd = new Date(r.paid_at);
      return pd >= d && pd < next;
    });
    const apptSlice = (allAppointments ?? []).filter((a) => {
      const pd = new Date(a.appointment_date);
      return pd >= d && pd < next;
    });
    return {
      label,
      revenue: slice.reduce((s, r) => s + r.amount, 0),
      transactions: apptSlice.length,
    };
  });

  // ── Average rating ────────────────────────────────────────────────────────
  const avgRating =
    (reviewRows?.length ?? 0) > 0
      ? (reviewRows!.reduce((s, r) => s + r.rating, 0) / reviewRows!.length).toFixed(1)
      : "—";

  // ── Top doctors by appointment count ─────────────────────────────────────
  const doctorMap = new Map<string, { name: string; spec: string; count: number }>();
  for (const a of topDoctorsRaw ?? []) {
    const key  = a.doctor_id;
    const doc  = (a as any).doctors;
    const prev = doctorMap.get(key);
    if (prev) { prev.count++; }
    else { doctorMap.set(key, { name: doc?.full_name ?? "Unknown", spec: doc?.specialization ?? "—", count: 1 }); }
  }
  const topDoctors = [...doctorMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);

  // ── Day-of-week distribution ──────────────────────────────────────────────
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const a of allAppointments ?? []) {
    const d = new Date(a.appointment_date).getDay();
    dowMap[d] = (dowMap[d] ?? 0) + 1;
  }
  const dowData = days.map((name, i) => ({ name, count: dowMap[i] ?? 0 }));

  // ── 7-day sparkline data for stat cards ──────────────────────────────────
  const userSparkline = Array.from({ length: 7 }, (_, i) => {
    const d    = new Date(now.getTime() - (6 - i) * 86400000).toISOString().split("T")[0];
    return (allAppointments ?? []).filter((a) => a.appointment_date === d).length;
  });
  // (We'll show appointment count per day for sparklines — meaningful trend)

  const revenueSparkline = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000).toISOString().split("T")[0];
    return (revenueRows ?? []).filter((r) => r.paid_at?.startsWith(d)).reduce((s, r) => s + r.amount, 0);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmtPKR = (n: number) =>
    n >= 1_000_000 ? `PKR ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `PKR ${(n / 1_000).toFixed(1)}K`
    : `PKR ${n}`;

  const pctChange = (curr: number, prev: number): { val: string; type: "positive" | "negative" } => {
    if (prev === 0) return { val: curr > 0 ? "+100%" : "0%", type: "positive" };
    const p = ((curr - prev) / prev) * 100;
    return { val: `${p >= 0 ? "+" : ""}${p.toFixed(0)}%`, type: p >= 0 ? "positive" : "negative" };
  };

  const userGrowth    = pctChange(usersThisWeek ?? 0, usersLastWeek ?? 0);
  const apptGrowth    = pctChange(apptThisWeek?.length ?? 0, apptLastWeek?.length ?? 0);
  const revGrowth     = pctChange(thisMonthRevenue, lastMonthRevenue);

  const STATUS_STYLE: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    pending:   "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    no_show:   "bg-gray-100 text-gray-600",
  };

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m    = Math.floor(diff / 60000);
    if (m < 1)   return "just now";
    if (m < 60)  return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform performance overview — real-time data
        </p>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={String(totalUsers ?? 0)}
          change={userGrowth.val}
          changeType={userGrowth.type}
          icon="👤"
          trend="vs last week"
          sparklineColor="blue"
          sparklineData={userSparkline}
          index={0}
        />
        <StatsCard
          title="Verified Doctors"
          value={`${verifiedDoctors ?? 0}/${totalDoctors ?? 0}`}
          change={`${pendingDoctors ?? 0} pending`}
          changeType={((pendingDoctors ?? 0) > 0 ? "negative" : "positive")}
          icon="🩺"
          trend="require verification"
          sparklineColor="purple"
          sparklineData={Array.from({ length: 7 }, (_, i) => (verifiedDoctors ?? 0) - i)}
          index={1}
        />
        <StatsCard
          title="Total Appointments"
          value={String(totalAppointments)}
          change={apptGrowth.val}
          changeType={apptGrowth.type}
          icon="📅"
          trend="vs last week"
          sparklineColor="green"
          sparklineData={userSparkline}
          index={2}
        />
        <StatsCard
          title="Monthly Revenue"
          value={fmtPKR(thisMonthRevenue)}
          change={revGrowth.val}
          changeType={revGrowth.type}
          icon="💰"
          trend="vs last month"
          sparklineColor="orange"
          sparklineData={revenueSparkline.map((v) => v / 1000)}
          index={3}
        />
      </div>

      {/* ── Secondary metrics strip ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Completed",       value: completedCount,  color: "text-blue-700",   bg: "bg-blue-50"   },
          { label: "Confirmed",        value: confirmedCount,  color: "text-green-700",  bg: "bg-green-50"  },
          { label: "Pending",          value: pendingCount,    color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "Cancelled",        value: cancelledCount,  color: "text-red-600",    bg: "bg-red-50"    },
          { label: "No-Show",          value: noShowCount,     color: "text-gray-600",   bg: "bg-gray-100"  },
          { label: "Completion Rate",  value: `${completionRate}%`, color: "text-violet-700", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-0.5 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyChartData} />
        </div>
        <AppointmentStatusChart
          completed={completedCount}
          confirmed={confirmedCount}
          pending={pendingCount}
          cancelled={cancelledCount}
          noShow={noShowCount}
          avgRating={avgRating}
          totalReviews={reviewRows?.length ?? 0}
        />
      </div>

      {/* ── Analytics Charts (top doctors + day-of-week) ── */}
      <AnalyticsCharts topDoctors={topDoctors} dowData={dowData} />

      {/* ── Additional KPIs ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">All-Time Revenue</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{fmtPKR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-gray-400">{revenueRows?.length ?? 0} successful payments</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Avg Patient Rating</p>
          <p className="mt-1 text-3xl font-bold text-yellow-500">{avgRating} ★</p>
          <p className="mt-1 text-xs text-gray-400">{reviewRows?.length ?? 0} total reviews</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">New Doctors This Month</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{doctorsThisMonth ?? 0}</p>
          <p className="mt-1 text-xs text-gray-400">{pendingDoctors ?? 0} awaiting verification</p>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          <a href="/admin/appointments" className="text-xs font-medium text-blue-600 hover:underline">
            View all →
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentAppointments ?? []).map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {((a as any).users?.full_name ?? a.patient_name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900">
                  <span className="font-medium">{(a as any).users?.full_name ?? a.patient_name}</span>
                  {" "}booked with{" "}
                  <span className="font-medium">Dr. {(a as any).doctors?.full_name}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(a.appointment_date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })} at {a.appointment_time} · {timeAgo(a.created_at)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                {a.status}
              </span>
            </div>
          ))}
          {(recentAppointments?.length ?? 0) === 0 && (
            <p className="px-5 py-10 text-center text-sm text-gray-400">No appointments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
