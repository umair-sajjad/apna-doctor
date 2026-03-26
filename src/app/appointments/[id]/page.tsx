import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReviewForm from "./ReviewForm";
import {
  ArrowLeft,
  Stethoscope,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Star,
} from "lucide-react";

export default async function AppointmentDetailPage({
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
    .select(
      "*, doctors(full_name, specialization, clinic_name, clinic_address, phone)"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!appointment) notFound();

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("appointment_id", id)
    .single();

  const canReview = appointment.status === "completed" && !review;

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    completed: { bg: "#d1fae5", color: "#059669" },
    confirmed: { bg: "var(--primary-light)", color: "var(--primary)" },
    cancelled: { bg: "#fee2e2", color: "#dc2626" },
    pending: { bg: "#fef9c3", color: "#a16207" },
  };
  const statusStyle =
    STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Top nav bar */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Link
            href="/appointments"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={15} /> Back to Appointments
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Page title + status */}
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
            {appointment.status}
          </span>
        </div>

        <div className="space-y-4">
          {/* Doctor + appointment info */}
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
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(14,165,233,0.15)",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <Stethoscope size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="font-display font-bold text-white">
                    Dr. {appointment.doctors.full_name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {appointment.doctors.specialization}
                  </p>
                </div>
                <div
                  className="ml-auto hidden rounded-full px-3 py-1 font-mono text-xs font-medium sm:block"
                  style={{
                    background: "rgba(14,165,233,0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {appointment.booking_reference}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div
              className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
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
                {
                  icon: MapPin,
                  label: "Clinic",
                  value: `${appointment.doctors.clinic_name} — ${appointment.doctors.clinic_address}`,
                },
                {
                  icon: Phone,
                  label: "Doctor's Phone",
                  value: appointment.doctors.phone,
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
                      {item.value}
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
              <p
                className="mb-2 text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Chief Complaint
              </p>
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
              <CreditCard size={16} style={{ color: "var(--primary)" }} />
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

          {/* Existing review */}
          {review && (
            <div
              className="rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Star size={16} style={{ color: "#eab308" }} />
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Your Review
                </p>
              </div>
              <div className="mb-3 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.review_text && (
                <p className="text-sm leading-relaxed text-gray-600">
                  {review.review_text}
                </p>
              )}
            </div>
          )}

          {/* Review form */}
          {canReview && (
            <div
              className="rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <p
                className="mb-1 text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Rate Your Experience
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Help other patients by sharing your experience
              </p>
              <ReviewForm appointmentId={appointment.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
