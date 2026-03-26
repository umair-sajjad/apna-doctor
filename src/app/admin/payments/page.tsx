import { createClient } from "@supabase/supabase-js";
import PaymentsTable from "@/components/admin/PaymentsTable";
import { DollarSign, TrendingUp, Download, AlertCircle } from "lucide-react";

// Service-role client bypasses RLS so nested joins to appointments/users work
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPaymentsPage() {
  const supabase = adminSupabase;

  // Fetch all transaction records with appointment + doctor + user info
  const { data: transactions } = await supabase
    .from("payment_transactions")
    .select(
      `
      *,
      appointments(
        booking_reference,
        appointment_date,
        appointment_time,
        patient_name,
        patient_email,
        consultation_fee,
        doctors(full_name, specialization),
        users(full_name)
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = transactions ?? [];

  const succeeded = rows.filter((t) => t.status === "succeeded");
  const failed = rows.filter((t) => t.status === "failed");
  const pending = rows.filter((t) => t.status === "pending");

  const totalRevenue = succeeded.reduce((sum, t) => sum + t.amount, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthSucceeded = succeeded.filter(
    (t) => new Date(t.paid_at ?? t.created_at) >= monthStart
  );
  const monthRevenue = thisMonthSucceeded.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const avgTransaction = succeeded.length
    ? Math.round(totalRevenue / succeeded.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payments &amp; Transactions
          </h1>
          <p className="mt-1 text-gray-600">
            Full audit log of all Stripe payment events
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-green-100">Total Revenue</p>
            <DollarSign className="h-6 w-6 text-green-100" />
          </div>
          <p className="text-3xl font-bold">
            PKR {totalRevenue.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-green-100">
            {succeeded.length} successful payments
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">This Month</p>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            PKR {monthRevenue.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-green-600">
            ↑ {thisMonthSucceeded.length} transactions
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-2 text-sm text-gray-600">Avg Transaction</p>
          <p className="text-3xl font-bold text-gray-900">
            PKR {avgTransaction.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500">Per successful payment</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Failed / Pending</p>
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {failed.length}{" "}
            <span className="text-lg text-gray-400">/ {pending.length}</span>
          </p>
          <p className="mt-2 text-sm text-red-500">
            {failed.length} failed payments
          </p>
        </div>
      </div>

      <PaymentsTable transactions={rows} />
    </div>
  );
}
