import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  UserCog,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get quick stats
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: totalDoctors } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true });

  const { count: verifiedDoctors } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true);

  const { count: pendingVerifications } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false);

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*")
    .gte("appointment_date", new Date().toISOString().split("T")[0]);

  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctors(full_name, specialization),
      users(full_name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentDoctors } = await supabase
    .from("doctors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate revenue
  const { data: paidAppointments } = await supabase
    .from("appointments")
    .select("consultation_fee")
    .eq("payment_status", "completed");

  const totalRevenue =
    paidAppointments?.reduce((sum, a) => sum + a.consultation_fee, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Admin!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="group block">
          <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {totalUsers || 0}
            </p>
            <p className="mt-2 text-sm text-green-600">View all users →</p>
          </div>
        </Link>

        <Link href="/admin/doctors" className="group block">
          <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600">
                {pendingVerifications} pending
              </span>
            </div>
            <p className="text-sm text-gray-600">Verified Doctors</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {verifiedDoctors}/{totalDoctors}
            </p>
            <p className="mt-2 text-sm text-purple-600">Manage doctors →</p>
          </div>
        </Link>

        <Link href="/admin/appointments" className="group block">
          <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">
                {todayAppointments?.length} today
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {totalAppointments || 0}
            </p>
            <p className="mt-2 text-sm text-orange-600">View appointments →</p>
          </div>
        </Link>

        <Link href="/admin/revenue" className="group block">
          <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              PKR {(totalRevenue / 1000).toFixed(0)}K
            </p>
            <p className="mt-2 text-sm text-green-600">View revenue →</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Verifications */}
        {pendingVerifications! > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Action Required</h3>
                <p className="mt-1 text-sm text-gray-700">
                  {pendingVerifications} doctor
                  {pendingVerifications !== 1 ? "s" : ""} waiting for
                  verification
                </p>
                <Link
                  href="/admin/verification"
                  className="mt-3 inline-block text-sm font-medium text-yellow-700 hover:text-yellow-800"
                >
                  Review now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Today's Appointments */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
              <p className="mt-1 text-sm text-gray-700">
                {todayAppointments?.length || 0} appointment
                {todayAppointments?.length !== 1 ? "s" : ""} scheduled for today
              </p>
              <Link
                href="/admin/appointments"
                className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View schedule →
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                All Systems Operational
              </h3>
              <p className="mt-1 text-sm text-gray-700">
                Platform running smoothly with no issues
              </p>
              <Link
                href="/admin/logs"
                className="mt-3 inline-block text-sm font-medium text-green-700 hover:text-green-800"
              >
                View logs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Appointments
              </h2>
              <Link
                href="/admin/appointments"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentAppointments?.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.users?.full_name || appointment.patient_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      with Dr. {appointment.doctors.full_name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}{" "}
                        at {appointment.appointment_time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Doctor Registrations */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                New Doctors
              </h2>
              <Link
                href="/admin/doctors"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDoctors?.map((doctor) => (
              <div key={doctor.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-medium text-purple-600">
                      {doctor.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {doctor.full_name}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {doctor.specialization}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Registered{" "}
                        {new Date(doctor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      doctor.is_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doctor.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
