import { createClient } from "@supabase/supabase-js";
import AppointmentsTable from "@/components/admin/AppointmentsTable";
import { Download } from "lucide-react";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminAppointmentsPage() {
  const supabase = adminSupabase;

  const { data: appointments, count } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctors(full_name, specialization),
      users(full_name)
    `,
      { count: "exact" }
    )
    .order("appointment_date", { ascending: false })
    .limit(100);

  const confirmedCount =
    appointments?.filter((a) => a.status === "confirmed").length || 0;
  const completedCount =
    appointments?.filter((a) => a.status === "completed").length || 0;
  const cancelledCount =
    appointments?.filter((a) => a.status === "cancelled").length || 0;
  // Calculate revenue
  const totalRevenue =
    appointments
      ?.filter((a) => a.payment_status === "completed")
      .reduce((sum, a) => sum + a.consultation_fee, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointments Management
          </h1>
          <p className="mt-1 text-gray-600">
            Track and manage all appointments
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Total</p>
          <p className="text-3xl font-bold text-gray-900">{count || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Confirmed</p>
          <p className="text-3xl font-bold text-blue-600">{confirmedCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{cancelledCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            PKR {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <AppointmentsTable appointments={appointments || []} />
    </div>
  );
}
