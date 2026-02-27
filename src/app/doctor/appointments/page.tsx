import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DoctorAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const params = await searchParams;
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
    .select("id")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/dashboard");
  }

  let query = supabase
    .from("appointments")
    .select("*, users(full_name, phone, email)")
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.date) {
    query = query.eq("appointment_date", params.date);
  }

  const { data: appointments } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - same as dashboard */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              ApnaDoctor - Doctor Portal
            </h1>
            <nav className="flex gap-4">
              <Link href="/doctor/dashboard" className="text-gray-600">
                Dashboard
              </Link>
              <Link
                href="/doctor/appointments"
                className="font-medium text-blue-600"
              >
                Appointments
              </Link>
              <Link href="/doctor/availability" className="text-gray-600">
                Availability
              </Link>
              <Link href="/doctor/profile" className="text-gray-600">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold">All Appointments</h2>

        {/* Filters */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <form method="get" className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={params.status || ""}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={params.date || ""}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Appointments List */}
        <div className="mt-6 space-y-4">
          <p className="text-sm">
            Showing {appointments?.length || 0} appointments
          </p>

          {appointments?.map((apt) => (
            <div
              key={apt.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {apt.users?.full_name || apt.patient_name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                      {apt.appointment_time}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {apt.users?.phone || apt.patient_phone}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {apt.users?.email || apt.patient_email}
                    </p>
                    {apt.chief_complaint && (
                      <p>
                        <strong>Complaint:</strong> {apt.chief_complaint}
                      </p>
                    )}
                    <p>
                      <strong>Booking Ref:</strong> {apt.booking_reference}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/doctor/appointments/${apt.id}`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {appointments?.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
