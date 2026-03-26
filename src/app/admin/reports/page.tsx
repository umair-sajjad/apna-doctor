import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // Get data for reports
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: totalDoctors } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true });

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { data: paidAppointments } = await supabase
    .from("appointments")
    .select("consultation_fee")
    .eq("payment_status", "completed");

  const totalRevenue =
    paidAppointments?.reduce((sum, a) => sum + a.consultation_fee, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-gray-600">
            Generate and download platform reports
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <Users className="h-8 w-8 text-blue-100" />
          </div>
          <p className="text-sm text-blue-100">Total Users</p>
          <p className="mt-1 text-3xl font-bold">{totalUsers || 0}</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <Users className="h-8 w-8 text-purple-100" />
          </div>
          <p className="text-sm text-purple-100">Total Doctors</p>
          <p className="mt-1 text-3xl font-bold">{totalDoctors || 0}</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <Calendar className="h-8 w-8 text-orange-100" />
          </div>
          <p className="text-sm text-orange-100">Appointments</p>
          <p className="mt-1 text-3xl font-bold">{totalAppointments || 0}</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="mb-2 flex items-center justify-between">
            <DollarSign className="h-8 w-8 text-green-100" />
          </div>
          <p className="text-sm text-green-100">Revenue</p>
          <p className="mt-1 text-3xl font-bold">
            PKR {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "User Activity Report",
            description:
              "Detailed analysis of user registrations, logins, and activity patterns",
            icon: Users,
            color: "blue",
          },
          {
            title: "Revenue Report",
            description:
              "Comprehensive revenue breakdown by time period, doctor, and specialty",
            icon: DollarSign,
            color: "green",
          },
          {
            title: "Appointment Analytics",
            description:
              "Statistics on bookings, cancellations, and completion rates",
            icon: Calendar,
            color: "orange",
          },
          {
            title: "Doctor Performance",
            description:
              "Doctor ratings, reviews, and appointment volume analysis",
            icon: TrendingUp,
            color: "purple",
          },
          {
            title: "Payment Transactions",
            description: "Detailed payment history with success/failure rates",
            icon: FileText,
            color: "indigo",
          },
          {
            title: "System Health",
            description: "Platform performance metrics and error logs",
            icon: FileText,
            color: "red",
          },
        ].map((report, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <div
              className={`h-12 w-12 rounded-lg bg-${report.color}-100 mb-4 flex items-center justify-center`}
            >
              <report.icon className={`h-6 w-6 text-${report.color}-600`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {report.title}
            </h3>
            <p className="mb-4 text-sm text-gray-600">{report.description}</p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                View
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Report Builder */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Custom Report Builder
        </h2>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
              <option>User Activity</option>
              <option>Revenue</option>
              <option>Appointments</option>
              <option>Doctors</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Format
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
              <option>PDF</option>
              <option>Excel (CSV)</option>
              <option>JSON</option>
            </select>
          </div>
        </div>
        <button className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700">
          Generate Custom Report
        </button>
      </div>
    </div>
  );
}
