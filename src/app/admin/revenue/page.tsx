import { createClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import RevenueCharts from "@/components/admin/RevenueCharts";

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("appointments")
    .select("consultation_fee, appointment_date, payment_status")
    .eq("payment_status", "completed");

  const totalRevenue =
    payments?.reduce((sum, p) => sum + p.consultation_fee, 0) || 0;

  // This month revenue
  const thisMonth = payments?.filter(
    (p) =>
      new Date(p.appointment_date) >=
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const monthRevenue =
    thisMonth?.reduce((sum, p) => sum + p.consultation_fee, 0) || 0;

  // Last month revenue
  const lastMonth = payments?.filter((p) => {
    const date = new Date(p.appointment_date);
    const lastMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    return date >= lastMonthStart && date < lastMonthEnd;
  });
  const lastMonthRevenue =
    lastMonth?.reduce((sum, p) => sum + p.consultation_fee, 0) || 0;

  const growth = lastMonthRevenue
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  // Monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - (5 - i),
      1
    );
    const monthName = date.toLocaleString("default", { month: "short" });

    const monthPayments = payments?.filter((p) => {
      const pDate = new Date(p.appointment_date);
      return (
        pDate.getMonth() === date.getMonth() &&
        pDate.getFullYear() === date.getFullYear()
      );
    });

    const revenue =
      monthPayments?.reduce((sum, p) => sum + p.consultation_fee, 0) || 0;

    return {
      month: monthName,
      revenue,
      transactions: monthPayments?.length || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="mt-1 text-gray-600">
          Track platform revenue and financial metrics
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <DollarSign className="h-8 w-8 text-green-100" />
          </div>
          <p className="text-sm text-green-100">Total Revenue</p>
          <p className="mt-1 text-3xl font-bold">
            PKR {totalRevenue.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-green-100">All time</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900">
            PKR {monthRevenue.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1">
            {growth >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">+{growth.toFixed(1)}%</p>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{growth.toFixed(1)}%</p>
              </>
            )}
            <p className="text-sm text-gray-500">vs last month</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-2 text-sm text-gray-600">Avg Transaction</p>
          <p className="text-3xl font-bold text-gray-900">
            PKR{" "}
            {payments?.length ? Math.round(totalRevenue / payments.length) : 0}
          </p>
          <p className="mt-2 text-sm text-gray-500">Per booking</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-2 text-sm text-gray-600">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">
            {payments?.length || 0}
          </p>
          <p className="mt-2 text-sm text-gray-500">Completed payments</p>
        </div>
      </div>

      {/* Charts */}
      <RevenueCharts monthlyData={monthlyData} />
    </div>
  );
}
