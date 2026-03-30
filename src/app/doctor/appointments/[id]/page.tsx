import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AppointmentActions from "./AppointmentActions";
import Logo from "@/components/shared/logo";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CalendarDays,
  Clock,
  CreditCard,
  MessageSquare,
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

export default async function DoctorAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, users(full_name, phone, email)")
    .eq("id", id)
    .eq("doctor_id", user.id)
    .single();

  if (!appointment) notFound();

  const statusStyle =
    STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Logo size="sm" />
          <Link
            href="/doctor/appointments"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={14} /> Back to Appointments
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Title row */}
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="font-display text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--text-dark)" }}
          >
            Appointment Details
          </h1>
          <span
            className="rounded-full px-4 py-1.5 text-sm font-semibold capitalize"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {statusStyle.label}
          </span>
        </div>

        <div className="space-y-5">
          {/* Patient + appointment info */}
          <div
            className="overflow-hidden rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            {/* Dark header */}
            <div
              className="relative overflow-hidden px-6 py-5"
              style={{ background: "var(--text-dark)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">
                    {appointment.users?.full_name || appointment.patient_name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Patient
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 font-mono text-xs font-medium"
                  style={{
                    background: "rgba(14,165,233,0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {appointment.booking_reference}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div
              className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
                {
                  icon: Phone,
                  label: "Phone",
                  value: appointment.users?.phone || appointment.patient_phone,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: appointment.users?.email || appointment.patient_email,
                },
                {
                  icon: CalendarDays,
                  label: "Date",
                  value: new Date(
                    appointment.appointment_date
                  ).toLocaleDateString("en-PK", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
                {
                  icon: Clock,
                  label: "Time",
                  value: appointment.appointment_time,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-5"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <item.icon size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p
                      className="mt-0.5 text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {item.value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chief complaint */}
          {appointment.chief_complaint && (
            <div
              className="rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare size={15} style={{ color: "var(--primary)" }} />
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Chief Complaint
                </p>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                {appointment.chief_complaint}
              </p>
            </div>
          )}

          {/* Payment info */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Payment
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Consultation Fee</p>
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  PKR {appointment.consultation_fee.toLocaleString()}
                </p>
                {appointment.payment_method && (
                  <p className="mt-0.5 text-xs text-gray-400 capitalize">
                    via {appointment.payment_method}
                  </p>
                )}
              </div>
              <span
                className="rounded-full px-3 py-1.5 text-xs font-semibold capitalize"
                style={
                  appointment.payment_status === "completed"
                    ? { background: "#d1fae5", color: "#059669" }
                    : { background: "#fef9c3", color: "#a16207" }
                }
              >
                {appointment.payment_status}
              </span>
            </div>
          </div>

          {/* Actions */}
          {appointment.status !== "completed" &&
            appointment.status !== "cancelled" && (
              <AppointmentActions
                appointmentId={appointment.id}
                currentStatus={appointment.status}
              />
            )}
        </div>
      </div>
    </div>
  );
}
