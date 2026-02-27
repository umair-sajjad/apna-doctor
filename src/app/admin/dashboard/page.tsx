import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!admin) {
    redirect("/dashboard");
  }

  // Get stats
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

  const { count: pendingDoctors } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false);

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              ApnaDoctor - Admin Panel
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/admin/dashboard"
                className="font-medium text-blue-600"
              >
                Dashboard
              </Link>
              <Link href="/admin/doctors" className="text-gray-600">
                Doctors
              </Link>
              <Link href="/admin/appointments" className="text-gray-600">
                Appointments
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">Admin Dashboard</h2>
        <p className="mt-2 text-gray-600">Platform Overview</p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalUsers || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Total Doctors</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {totalDoctors || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Verified Doctors</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {verifiedDoctors || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Pending Verification</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingDoctors || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {totalAppointments || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Completed Appointments</p>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {completedAppointments || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-black">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Link
              href="/admin/doctors?status=pending"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">👨‍⚕️</div>
              <p className="mt-2 font-medium text-black">
                Verify Doctors ({pendingDoctors})
              </p>
            </Link>
            <Link
              href="/admin/appointments"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">📅</div>
              <p className="mt-2 font-medium text-black">View Appointments</p>
            </Link>
            <Link
              href="/admin/reports"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">📊</div>
              <p className="mt-2 font-medium text-black">View Reports</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
