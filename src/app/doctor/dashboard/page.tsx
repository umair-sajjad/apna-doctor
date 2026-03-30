import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import {
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Star,
  Clock,
  User,
  ChevronRight,
  BarChart2,
  Stethoscope,
} from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  completed: { bg: "#d1fae5", color: "#059669" },
  confirmed: { bg: "var(--primary-light)", color: "var(--primary)" },
  pending: { bg: "#fef9c3", color: "#a16207" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
};

export default async function DoctorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/login/doctor");

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*, users(full_name, phone)")
    .eq("doctor_id", user.id)
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true });

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

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id);

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id)
    .eq("status", "completed");

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments?.length ?? 0,
      icon: CalendarDays,
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      label: "Upcoming (7 days)",
      value: upcomingAppointments?.length ?? 0,
      icon: Clock,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      label: "Total Appointments",
      value: totalAppointments ?? 0,
      icon: LayoutDashboard,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
    {
      label: "Average Rating",
      value: (doctor.average_rating ?? 0).toFixed(1),
      icon: Star,
      color: "#d97706",
      bg: "#fef3c7",
    },
  ];

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
          <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                Welcome back
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
                Dr. {doctor.full_name}
              </h1>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {doctor.specialization}
              </p>
            </div>
            <Link
              href="/doctor/appointments"
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 sm:mt-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <CalendarDays size={15} /> All Appointments
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="absolute top-0 right-0 left-0 h-0.5 rounded-t-2xl"
                style={{ background: stat.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p
                    className="font-display mt-2 text-3xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: stat.bg }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's appointments */}
          <div
            className="col-span-1 rounded-2xl bg-white lg:col-span-2"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <CalendarDays size={15} style={{ color: "var(--primary)" }} />
              <h3
                className="font-display font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                Today's Appointments
              </h3>
              <span
                className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                }}
              >
                {todayAppointments?.length ?? 0}
              </span>
            </div>

            <div
              className="divide-y px-6"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {todayAppointments && todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => {
                  const statusStyle =
                    STATUS_STYLES[apt.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "var(--primary-light)" }}
                        >
                          <User size={15} style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-dark)" }}
                          >
                            {apt.users?.full_name || apt.patient_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {apt.appointment_time}
                            {apt.chief_complaint && (
                              <>
                                {" "}
                                · {apt.chief_complaint.slice(0, 40)}
                                {apt.chief_complaint.length > 40 ? "…" : ""}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="hidden rounded-full px-2.5 py-1 text-xs font-semibold capitalize sm:inline-block"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {apt.status}
                        </span>
                        <Link
                          href={`/doctor/appointments/${apt.id}`}
                          className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-blue-50"
                          style={{
                            borderColor: "var(--primary-light)",
                            color: "var(--primary)",
                          }}
                        >
                          View <ChevronRight size={11} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <CalendarDays
                      size={20}
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">No appointments today</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Upcoming */}
            <div
              className="rounded-2xl bg-white"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: "var(--primary-light)" }}
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: "var(--primary)" }} />
                  <h3
                    className="font-display text-sm font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    Upcoming
                  </h3>
                </div>
                <Link
                  href="/doctor/appointments"
                  className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  View All <ChevronRight size={12} />
                </Link>
              </div>

              <div
                className="divide-y px-5"
                style={{ borderColor: "var(--primary-light)" }}
              >
                {upcomingAppointments && upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {apt.users?.full_name || apt.patient_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "en-PK",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          · {apt.appointment_time}
                        </p>
                      </div>
                      <Link
                        href={`/doctor/appointments/${apt.id}`}
                        className="text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ color: "var(--primary)" }}
                      >
                        View
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-gray-400">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </div>

            {/* Analytics shortcut */}
            <Link
              href="/doctor/analytics"
              className="group flex items-start gap-4 rounded-2xl bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--primary-light)" }}
              >
                <BarChart2 size={20} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p
                  className="font-display font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  Analytics
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Revenue reports and performance metrics
                </p>
              </div>
              <ChevronRight
                size={16}
                className="mt-1 ml-auto shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            {/* Availability shortcut */}
            <Link
              href="/doctor/availability"
              className="group flex items-start gap-4 rounded-2xl bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "#d1fae5" }}
              >
                <Stethoscope size={20} style={{ color: "#059669" }} />
              </div>
              <div>
                <p
                  className="font-display font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  Manage Availability
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Set your working hours and slot durations
                </p>
              </div>
              <ChevronRight
                size={16}
                className="mt-1 ml-auto shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
