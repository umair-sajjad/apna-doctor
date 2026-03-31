import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Users,
  UserCog,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
  Stethoscope,
} from "lucide-react";

// Service-role client — bypasses RLS for cross-table admin queries
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminDashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const lastMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  ).toISOString();

  // ── Parallel queries ──────────────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: totalDoctors },
    { count: verifiedDoctors },
    { count: pendingVerifications },
    { count: totalAppointments },
    { count: todayAppointmentsCount },
    { count: completedAppointments },
    { count: cancelledAppointments },
    { data: recentAppointments },
    { data: recentDoctors },
    { data: allRevenue },
    { data: recentTransactions },
  ] = await Promise.all([
    adminSupabase.from("users").select("*", { count: "exact", head: true }),
    adminSupabase.from("doctors").select("*", { count: "exact", head: true }),
    adminSupabase
      .from("doctors")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true),
    adminSupabase
      .from("doctors")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", false),
    adminSupabase
      .from("appointments")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", today),
    adminSupabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    adminSupabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled"),
    adminSupabase
      .from("appointments")
      .select("*, doctors(full_name, specialization), users(full_name)")
      .order("created_at", { ascending: false })
      .limit(6),
    adminSupabase
      .from("doctors")
      .select("id, full_name, specialization, is_verified, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    // Revenue from authoritative source: payment_transactions
    adminSupabase
      .from("payment_transactions")
      .select("amount, paid_at, status")
      .eq("status", "succeeded"),
    adminSupabase
      .from("payment_transactions")
      .select(
        "id, amount, paid_at, status, payment_method_type, appointments(booking_reference, patient_name, doctors(full_name))"
      )
      .eq("status", "succeeded")
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  // ── Revenue calculations (from payment_transactions only) ─────────────────
  const totalRevenue = (allRevenue ?? []).reduce((s, t) => s + t.amount, 0);

  const thisMonthRevenue = (allRevenue ?? [])
    .filter((t) => t.paid_at && t.paid_at >= monthStart)
    .reduce((s, t) => s + t.amount, 0);

  const lastMonthRevenue = (allRevenue ?? [])
    .filter((t) => t.paid_at && t.paid_at >= lastMonthStart && t.paid_at < monthStart)
    .reduce((s, t) => s + t.amount, 0);

  const todayRevenue = (allRevenue ?? [])
    .filter((t) => t.paid_at && t.paid_at.startsWith(today))
    .reduce((s, t) => s + t.amount, 0);

  const revenueGrowth = lastMonthRevenue
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : null;

  // ── Status helpers ────────────────────────────────────────────────────────
  const fmtPKR = (n: number) =>
    n >= 1_000_000
      ? `PKR ${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `PKR ${(n / 1_000).toFixed(1)}K`
        : `PKR ${n}`;

  const STATUS_STYLE: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/revenue"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Revenue Report
          </Link>
          <Link
            href="/admin/payments"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            All Payments
          </Link>
        </div>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          href="/admin/revenue"
          label="Total Revenue"
          value={fmtPKR(totalRevenue)}
          sub={`${fmtPKR(thisMonthRevenue)} this month`}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
          trend={
            revenueGrowth !== null
              ? {
                  value: Number(revenueGrowth),
                  label: "vs last month",
                }
              : undefined
          }
        />
        <KpiCard
          href="/admin/users"
          label="Total Users"
          value={String(totalUsers ?? 0)}
          sub="Registered patients"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <KpiCard
          href="/admin/doctors"
          label="Doctors"
          value={`${verifiedDoctors ?? 0}/${totalDoctors ?? 0}`}
          sub={`${pendingVerifications ?? 0} pending verification`}
          icon={<Stethoscope className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
          alert={(pendingVerifications ?? 0) > 0}
        />
        <KpiCard
          href="/admin/appointments"
          label="Appointments"
          value={String(totalAppointments ?? 0)}
          sub={`${todayAppointmentsCount ?? 0} today`}
          icon={<Calendar className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-100"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          label="Today's Revenue"
          value={fmtPKR(todayRevenue)}
          icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
          color="text-emerald-700"
        />
        <MiniStat
          label="Completed Appointments"
          value={String(completedAppointments ?? 0)}
          icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
          color="text-blue-700"
        />
        <MiniStat
          label="Cancelled Appointments"
          value={String(cancelledAppointments ?? 0)}
          icon={<XCircle className="h-4 w-4 text-red-500" />}
          color="text-red-600"
        />
        <MiniStat
          label="Avg Booking Value"
          value={
            (allRevenue?.length ?? 0) > 0
              ? fmtPKR(Math.round(totalRevenue / allRevenue!.length))
              : "PKR 0"
          }
          icon={<TrendingUp className="h-4 w-4 text-violet-600" />}
          color="text-violet-700"
        />
      </div>

      {/* ── Action Banners ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(pendingVerifications ?? 0) > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Action Required</p>
              <p className="mt-0.5 text-xs text-gray-600">
                {pendingVerifications} doctor{pendingVerifications !== 1 ? "s" : ""} awaiting verification
              </p>
              <Link
                href="/admin/doctors"
                className="mt-2 inline-block text-xs font-semibold text-yellow-700 hover:underline"
              >
                Review now →
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Today's Schedule</p>
            <p className="mt-0.5 text-xs text-gray-600">
              {todayAppointmentsCount ?? 0} appointment{todayAppointmentsCount !== 1 ? "s" : ""} scheduled
            </p>
            <Link
              href="/admin/appointments"
              className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline"
            >
              View schedule →
            </Link>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">This Month Revenue</p>
            <p className="mt-0.5 text-xs text-gray-600">
              {fmtPKR(thisMonthRevenue)}
              {revenueGrowth !== null && (
                <span
                  className={`ml-2 font-semibold ${
                    Number(revenueGrowth) >= 0 ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {Number(revenueGrowth) >= 0 ? "+" : ""}
                  {revenueGrowth}% MoM
                </span>
              )}
            </p>
            <Link
              href="/admin/revenue"
              className="mt-2 inline-block text-xs font-semibold text-green-700 hover:underline"
            >
              Full report →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentAppointments ?? []).map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {appt.users?.full_name ?? appt.patient_name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    Dr. {appt.doctors?.full_name} · {new Date(appt.appointment_date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })} {appt.appointment_time}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    STATUS_STYLE[appt.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {appt.status}
                </span>
              </div>
            ))}
            {(recentAppointments?.length ?? 0) === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No appointments yet</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Payments</h2>
            <Link href="/admin/payments" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentTransactions ?? []).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {(tx as any).appointments?.patient_name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {(tx as any).appointments?.doctors?.full_name
                      ? `Dr. ${(tx as any).appointments.doctors.full_name}`
                      : "—"}{" "}
                    · {(tx as any).appointments?.booking_reference ?? ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-green-600">
                    PKR {(tx as any).amount?.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {(tx as any).paid_at
                      ? new Date((tx as any).paid_at).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            ))}
            {(recentTransactions?.length ?? 0) === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No payments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── New Doctors ── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recently Registered Doctors</h2>
          <Link href="/admin/doctors" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentDoctors ?? []).map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                {doc.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Dr. {doc.full_name}</p>
                <p className="truncate text-xs text-gray-500">{doc.specialization}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-gray-400">
                  {new Date(doc.created_at).toLocaleDateString("en-PK", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    doc.is_verified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {doc.is_verified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small reusable components ───────────────────────────────────────────────

function KpiCard({
  href,
  label,
  value,
  sub,
  icon,
  iconBg,
  trend,
  alert,
}: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
  alert?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value >= 0 ? "+" : ""}
              {trend.value.toFixed(1)}%
            </div>
          )}
          {alert && !trend && (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{sub}</p>
      </div>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{label}</p>
        <p className={`text-base font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
