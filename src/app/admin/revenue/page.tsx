import { createClient } from "@supabase/supabase-js";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart2,
  XCircle,
  CheckCircle,
} from "lucide-react";
import RevenueCharts from "@/components/admin/RevenueCharts";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminRevenuePage() {
  // ── Fetch authoritative payment data ─────────────────────────────────────
  const [{ data: transactions }, { data: doctorRevData }] = await Promise.all([
    adminSupabase
      .from("payment_transactions")
      .select("amount, paid_at, status, payment_method_type")
      .order("paid_at", { ascending: true }),

    // Revenue broken down by doctor via appointments join
    adminSupabase
      .from("payment_transactions")
      .select(
        "amount, paid_at, status, appointments(doctor_id, doctors(full_name, specialization))"
      )
      .eq("status", "succeeded"),
  ]);

  const succeeded = (transactions ?? []).filter((t) => t.status === "succeeded");
  const failed    = (transactions ?? []).filter((t) => t.status === "failed");
  const refunded  = (transactions ?? []).filter((t) => t.status === "refunded");

  // ── KPI calculations ─────────────────────────────────────────────────────
  const totalRevenue   = succeeded.reduce((s, t) => s + t.amount, 0);
  const totalRefunded  = refunded.reduce((s, t) => s + t.amount, 0);
  const avgTransaction = succeeded.length
    ? Math.round(totalRevenue / succeeded.length)
    : 0;

  const now           = new Date();
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd  = monthStart;

  const thisMonthTx = succeeded.filter(
    (t) => t.paid_at && new Date(t.paid_at) >= monthStart
  );
  const lastMonthTx = succeeded.filter((t) => {
    if (!t.paid_at) return false;
    const d = new Date(t.paid_at);
    return d >= lastMonthStart && d < lastMonthEnd;
  });

  const thisMonthRevenue = thisMonthTx.reduce((s, t) => s + t.amount, 0);
  const lastMonthRevenue = lastMonthTx.reduce((s, t) => s + t.amount, 0);
  const growth = lastMonthRevenue
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : null;

  // ── 6-month monthly data ─────────────────────────────────────────────────
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });

    const slice = succeeded.filter((t) => {
      if (!t.paid_at) return false;
      const pd = new Date(t.paid_at);
      return pd >= d && pd < next;
    });

    return {
      month: label,
      revenue: slice.reduce((s, t) => s + t.amount, 0),
      transactions: slice.length,
    };
  });

  // ── Daily data for current month ─────────────────────────────────────────
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const slice = succeeded.filter(
      (t) => t.paid_at && t.paid_at.startsWith(dayStr)
    );
    return {
      day: String(day),
      revenue: slice.reduce((s, t) => s + t.amount, 0),
      transactions: slice.length,
    };
  });

  // ── Doctor breakdown ──────────────────────────────────────────────────────
  const doctorMap = new Map<
    string,
    { name: string; specialization: string; revenue: number; count: number }
  >();
  for (const tx of doctorRevData ?? []) {
    const appt = (tx as any).appointments;
    if (!appt?.doctor_id) continue;
    const key = appt.doctor_id;
    const existing = doctorMap.get(key);
    if (existing) {
      existing.revenue += tx.amount;
      existing.count   += 1;
    } else {
      doctorMap.set(key, {
        name:           appt.doctors?.full_name ?? "Unknown",
        specialization: appt.doctors?.specialization ?? "—",
        revenue:        tx.amount,
        count:          1,
      });
    }
  }
  const topDoctors = [...doctorMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // ── Specialization breakdown ──────────────────────────────────────────────
  const specMap = new Map<string, number>();
  for (const d of topDoctors) {
    specMap.set(d.specialization, (specMap.get(d.specialization) ?? 0) + d.revenue);
  }
  const specData = [...specMap.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // ── Payment method breakdown ──────────────────────────────────────────────
  const methodMap = new Map<string, number>();
  for (const t of succeeded) {
    const m = t.payment_method_type ?? "card";
    methodMap.set(m, (methodMap.get(m) ?? 0) + t.amount);
  }

  const fmtPKR = (n: number) =>
    n >= 1_000_000
      ? `PKR ${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000
        ? `PKR ${(n / 1_000).toFixed(1)}K`
        : `PKR ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          All figures sourced from verified Stripe payment transactions
        </p>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white">
          <div className="mb-3 flex items-center justify-between">
            <DollarSign className="h-6 w-6 text-green-100" />
            <span className="text-xs text-green-100">All time</span>
          </div>
          <p className="text-xs text-green-100">Total Revenue</p>
          <p className="mt-0.5 text-3xl font-bold">{fmtPKR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-green-100">{succeeded.length} payments</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {growth !== null && (
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">This Month</p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900">
            {fmtPKR(thisMonthRevenue)}
          </p>
          <p className="mt-1 text-xs text-gray-400">{thisMonthTx.length} transactions</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3">
            <BarChart2 className="h-5 w-5 text-violet-600" />
          </div>
          <p className="text-xs text-gray-500">Last Month</p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900">
            {fmtPKR(lastMonthRevenue)}
          </p>
          <p className="mt-1 text-xs text-gray-400">{lastMonthTx.length} transactions</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3">
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500">Avg Transaction</p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900">
            PKR {avgTransaction.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">per successful payment</p>
        </div>
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Succeeded</p>
            <p className="text-lg font-bold text-gray-900">{succeeded.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-lg font-bold text-gray-900">{failed.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <TrendingDown className="h-5 w-5 shrink-0 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Refunded</p>
            <p className="text-lg font-bold text-gray-900">{refunded.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <DollarSign className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-xs text-gray-500">Total Refunded</p>
            <p className="text-lg font-bold text-gray-900">{fmtPKR(totalRefunded)}</p>
          </div>
        </div>
      </div>

      {/* ── Charts (client component) ── */}
      <RevenueCharts
        monthlyData={monthlyData}
        dailyData={dailyData}
        topDoctors={topDoctors}
        specData={specData}
        currentMonthName={now.toLocaleString("default", { month: "long" })}
      />

      {/* ── Doctor Breakdown Table ── */}
      {topDoctors.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Top Doctors by Revenue
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Based on completed Stripe payments
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Doctor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Specialization
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Bookings
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Avg Fee
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total Revenue
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topDoctors.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                          {doc.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          Dr. {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {doc.specialization}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-gray-700">
                      {doc.count}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-gray-700">
                      PKR {Math.round(doc.revenue / doc.count).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-green-600">
                      PKR {doc.revenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${totalRevenue > 0 ? Math.round((doc.revenue / totalRevenue) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {totalRevenue > 0
                            ? Math.round((doc.revenue / totalRevenue) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
