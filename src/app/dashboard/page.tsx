import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();

  // Redirect doctors to their dashboard
  if (doctor) {
    redirect("/doctor/dashboard");
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get upcoming appointments
  const today = new Date().toISOString().split("T")[0];

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*, doctors(full_name, specialization)")
    .eq("user_id", user.id)
    .gte("appointment_date", today)
    .in("status", ["pending", "confirmed"])
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })
    .limit(5);

  // Get stats
  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ApnaDoctor
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="font-medium text-blue-600">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600">
                My Appointments
              </Link>
              <Link href="/doctors" className="text-gray-600">
                Find Doctors
              </Link>
              <Link href="/profile" className="text-gray-600">
                Profile
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">
          Welcome, {userData?.full_name}
        </h2>
        <p className="mt-2 text-gray-600">Manage your health appointments</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Upcoming Appointments</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {upcomingAppointments?.length || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {totalAppointments || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedAppointments || 0}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black">
              Upcoming Appointments
            </h3>
            <Link
              href="/appointments"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-black">
                      Dr. {apt.doctors.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {apt.doctors.specialization}
                    </p>
                    <p className="mt-1 text-sm text-black">
                      {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                      {apt.appointment_time}
                    </p>
                  </div>
                  <Link
                    href={`/appointments/${apt.id}`}
                    className="rounded-md border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    View
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No upcoming appointments
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-black">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Link
              href="/doctors"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">🔍</div>
              <p className="mt-2 font-medium text-black">Find a Doctor</p>
            </Link>
            <Link
              href="/appointments"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">📅</div>
              <p className="mt-2 font-medium text-black">My Appointments</p>
            </Link>
            <Link
              href="/doctors?specialization=General+Physician"
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600"
            >
              <div className="text-3xl">👨‍⚕️</div>
              <p className="mt-2 font-medium text-black">Quick Consultation</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
