import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import {
  CalendarDays,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
  confirmed: {
    bg: "var(--primary-light)",
    color: "var(--primary)",
    label: "Confirmed",
  },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
  pending: { bg: "#fef9c3", color: "#a16207", label: "Pending" },
  no_show: { bg: "#f3f4f6", color: "#6b7280", label: "No Show" },
};

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
  if (!user) redirect("/login");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/dashboard");

  let query = supabase
    .from("appointments")
    .select("*, users(full_name, phone, email)")
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.date) query = query.eq("appointment_date", params.date);

  const { data: appointments } = await query;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-8"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Schedule
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
              All Appointments
            </h1>
            <p
              className="mt-0.5 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {appointments?.length ?? 0} appointments found
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div
          className="mb-6 rounded-2xl bg-white p-5"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <form
            method="get"
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--text-dark)" }}
              >
                Status
              </label>
              <select
                name="status"
                defaultValue={params.status || ""}
                className="w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none"
                style={{
                  borderColor: "var(--primary-light)",
                  color: "var(--text-dark)",
                }}
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
              <label
                className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--text-dark)" }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={params.date || ""}
                className="w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none"
                style={{
                  borderColor: "var(--primary-light)",
                  color: "var(--text-dark)",
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                <Search size={14} /> Filter
              </button>
              {(params.status || params.date) && (
                <Link
                  href="/doctor/appointments"
                  className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50"
                  style={{
                    borderColor: "var(--primary-light)",
                    color: "var(--text-dark)",
                  }}
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          {appointments && appointments.length > 0 ? (
            appointments.map((apt) => {
              const statusStyle =
                STATUS_STYLES[apt.status] ?? STATUS_STYLES.pending;
              return (
                <div
                  key={apt.id}
                  className="group overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ border: "1px solid var(--primary-light)" }}
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Patient info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3
                          className="font-display font-bold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {apt.users?.full_name || apt.patient_name}
                        </h3>
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarDays
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "en-PK",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {apt.appointment_time}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {apt.users?.phone || apt.patient_phone}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={11} style={{ color: "var(--primary)" }} />
                          {apt.users?.email || apt.patient_email}
                        </span>
                      </div>

                      {apt.chief_complaint && (
                        <p className="mt-2 line-clamp-1 text-xs text-gray-400">
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-dark)" }}
                          >
                            Complaint:
                          </span>{" "}
                          {apt.chief_complaint}
                        </p>
                      )}

                      <p className="mt-1 font-mono text-xs text-gray-400">
                        {apt.booking_reference}
                      </p>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/doctor/appointments/${apt.id}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary), var(--accent))",
                        color: "white",
                      }}
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "var(--primary-light)" }}
              >
                <CalendarDays size={24} style={{ color: "var(--primary)" }} />
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                No appointments found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {params.status || params.date
                  ? "Try adjusting your filters"
                  : "Your appointments will appear here"}
              </p>
              {(params.status || params.date) && (
                <Link
                  href="/doctor/appointments"
                  className="mt-4 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
