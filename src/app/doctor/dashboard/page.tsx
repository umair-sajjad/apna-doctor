import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DoctorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get doctor details
  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/dashboard");
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Get today's appointments
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*, users(full_name, phone)")
    .eq("doctor_id", user.id)
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true });

  // Get upcoming appointments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*, users(full_name, phone)")
    .eq("doctor_id", user.id)
    .gte("appointment_date", today)
    .lte("appointment_date", nextWeek.toISOString().split("T")[0])
    .in("status", ["pending", "confirmed"])
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })
    .limit(10);

  // Get stats
  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id);

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id)
    .eq("status", "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              ApnaDoctor - Doctor Portal
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/doctor/dashboard"
                className="font-medium text-blue-600"
              >
                Dashboard
              </Link>
              <Link href="/doctor/appointments" className="text-gray-600">
                Appointments
              </Link>
              <Link href="/doctor/availability" className="text-gray-600">
                Availability
              </Link>
              <Link href="/doctor/profile" className="text-gray-600">
                Profile
              </Link>
              <Link href="/doctor/analytics" className="text-gray-600">
                Analytics
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">
          Welcome, Dr. {doctor.full_name}
        </h2>
        <p className="mt-2 text-gray-600">{doctor.specialization}</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Today's Appointments</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {todayAppointments?.length || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600">Upcoming (7 days)</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
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
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {doctor.average_rating.toFixed(1)} ⭐
            </p>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-black">
            Today's Appointments
          </h3>
          <div className="mt-4 space-y-3">
            {todayAppointments?.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-black">
                    {apt.users?.full_name || apt.patient_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {apt.appointment_time} •{" "}
                    {apt.chief_complaint || "No complaint specified"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      apt.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                  <Link
                    href={`/doctor/appointments/${apt.id}`}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
            {todayAppointments?.length === 0 && (
              <p className="text-center text-gray-500">
                No appointments scheduled for today
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black">
              Upcoming Appointments
            </h3>
            <Link
              href="/doctor/appointments"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingAppointments?.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-black">
                    {apt.users?.full_name || apt.patient_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                    {apt.appointment_time}
                  </p>
                </div>
                <Link
                  href={`/doctor/appointments/${apt.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  View
                </Link>
              </div>
            ))}
            {upcomingAppointments?.length === 0 && (
              <p className="text-center text-gray-500">
                No upcoming appointments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
