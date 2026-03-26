import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserNavbar from "@/components/shared/UserNavbar";
import {
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Search,
  Stethoscope,
  ChevronRight,
  Clock,
  Bot,
} from "lucide-react";

export default async function DashboardPage() {
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

  if (doctor) redirect("/doctor/dashboard");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userData) redirect("/login/user");

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

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const firstName = userData.full_name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Upcoming",
      value: upcomingAppointments?.length ?? 0,
      icon: CalendarDays,
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      label: "Total Appointments",
      value: totalAppointments ?? 0,
      icon: LayoutDashboard,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
    {
      label: "Completed",
      value: completedAppointments ?? 0,
      icon: CheckCircle2,
      color: "#059669",
      bg: "#d1fae5",
    },
  ];

  const quickActions = [
    {
      href: "/doctors",
      icon: Search,
      label: "Find a Doctor",
      desc: "Browse verified specialists",
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      href: "/appointments",
      icon: CalendarDays,
      label: "My Appointments",
      desc: "View & manage bookings",
      color: "#7c3aed",
      bg: "#ede9fe",
    },
    {
      href: "/chat",
      icon: Bot,
      label: "AI Assistant",
      desc: "Get matched instantly",
      color: "var(--accent)",
      bg: "#e0f2fe",
    },
    {
      href: "/doctors?specialization=General+Physician",
      icon: Stethoscope,
      label: "Quick Consultation",
      desc: "General physician near you",
      color: "#059669",
      bg: "#d1fae5",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-8"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-10"
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
                {userData.full_name}
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Here's an overview of your health activity
              </p>
            </div>
            <Link
              href="/doctors"
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 sm:mt-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Search size={15} />
              Find a Doctor
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p
                    className="font-display mt-2 text-4xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: stat.bg }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <div
            className="col-span-1 rounded-2xl bg-white lg:col-span-2"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <div className="flex items-center gap-2">
                <CalendarDays size={18} style={{ color: "var(--primary)" }} />
                <h3
                  className="font-display font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  Upcoming Appointments
                </h3>
              </div>
              <Link
                href="/appointments"
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div
              className="divide-y px-6"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--primary-light)" }}
                      >
                        <Stethoscope
                          size={16}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          Dr. {apt.doctors.full_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {apt.doctors.specialization}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
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
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block"
                        style={
                          apt.status === "confirmed"
                            ? { background: "#d1fae5", color: "#059669" }
                            : {
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                              }
                        }
                      >
                        {apt.status.charAt(0).toUpperCase() +
                          apt.status.slice(1)}
                      </span>
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-blue-50"
                        style={{
                          borderColor: "var(--primary-light)",
                          color: "var(--primary)",
                        }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <CalendarDays
                      size={24}
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dark)" }}
                  >
                    No upcoming appointments
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Book your first appointment to get started
                  </p>
                  <Link
                    href="/doctors"
                    className="mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    Find a Doctor
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <LayoutDashboard size={18} style={{ color: "var(--primary)" }} />
              <h3
                className="font-display font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: action.bg }}
                  >
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm leading-tight font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {action.label}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {action.desc}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="ml-auto shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
