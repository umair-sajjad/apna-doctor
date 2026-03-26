import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/payments/stripe";
import { sendAppointmentConfirmation } from "@/lib/notifications/service";
import Logo from "@/components/shared/logo";
import {
  CheckCircle2,
  Clock,
  CalendarDays,
  MapPin,
  Phone,
  CreditCard,
  Stethoscope,
  LayoutDashboard,
  Search,
  Bell,
  ArrowRight,
} from "lucide-react";

interface SearchParams {
  ref?: string;
  payment_intent?: string;
  redirect_status?: string;
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    ref,
    payment_intent: paymentIntentId,
    redirect_status: redirectStatus,
  } = await searchParams;

  if (!ref) redirect("/");

  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, doctors(full_name, specialization, clinic_name, clinic_address, phone)"
    )
    .eq("booking_reference", ref)
    .single();

  if (!appointment) redirect("/");

  let justConfirmed = false;

  if (
    redirectStatus === "succeeded" &&
    paymentIntentId &&
    appointment.status !== "confirmed"
  ) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status === "succeeded") {
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await adminSupabase
          .from("appointments")
          .update({
            status: "confirmed",
            payment_status: "completed",
            payment_method: (pi.payment_method_types?.[0] as string) ?? "card",
            transaction_id: pi.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointment.id);

        await adminSupabase.from("payment_transactions").upsert(
          {
            appointment_id: appointment.id,
            stripe_payment_intent_id: pi.id,
            amount: appointment.consultation_fee,
            currency: "pkr",
            status: "succeeded",
            stripe_status: pi.status,
            payment_method_type:
              (pi.payment_method_types?.[0] as string) ?? "card",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              amount_received: pi.amount_received,
              confirmed_by: "success_page",
            },
          },
          { onConflict: "stripe_payment_intent_id" }
        );

        sendAppointmentConfirmation(appointment.id).catch((err) =>
          console.error("[success] Notification error (non-critical):", err)
        );

        justConfirmed = true;
      }
    } catch (err) {
      console.error("[success] Failed to verify payment with Stripe:", err);
    }
  }

  const isConfirmed =
    justConfirmed ||
    (appointment.status === "confirmed" &&
      appointment.payment_status === "completed");

  const nextSteps = [
    "You'll receive SMS and email confirmations within a few minutes.",
    "We'll send reminders 2 hours before your appointment.",
    "Please arrive 10 minutes early at the clinic.",
    "Bring any previous medical reports if available.",
    "You can cancel or reschedule from your dashboard.",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Minimal header */}
      <header
        className="border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Logo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        {/* Status banner */}
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-10 text-center"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background: isConfirmed
                ? "radial-gradient(ellipse at center, #059669, transparent 60%)"
                : "radial-gradient(ellipse at center, var(--accent), transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={
                isConfirmed
                  ? {
                      background: "rgba(5,150,105,0.2)",
                      border: "1px solid rgba(5,150,105,0.3)",
                    }
                  : {
                      background: "rgba(14,165,233,0.15)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }
              }
            >
              {isConfirmed ? (
                <CheckCircle2 size={32} style={{ color: "#34d399" }} />
              ) : (
                <Clock size={32} style={{ color: "var(--accent)" }} />
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-white">
              {isConfirmed ? "Booking Confirmed!" : "Payment Processing…"}
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {isConfirmed
                ? "Your appointment has been successfully booked and confirmed."
                : "Your payment is being processed. You'll receive confirmation shortly."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2">
              <span
                className="rounded-full px-4 py-1.5 text-xs font-semibold"
                style={
                  isConfirmed
                    ? { background: "rgba(5,150,105,0.2)", color: "#34d399" }
                    : {
                        background: "rgba(14,165,233,0.15)",
                        color: "var(--accent)",
                      }
                }
              >
                {isConfirmed ? "Confirmed & Paid" : "Processing Payment"}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment details */}
        <div
          className="overflow-hidden rounded-2xl bg-white"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <div className="flex items-center gap-2">
              <Stethoscope size={16} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Appointment Details
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 font-mono text-xs font-medium"
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              {appointment.booking_reference}
            </span>
          </div>

          <div
            className="divide-y"
            style={{ borderColor: "var(--primary-light)" }}
          >
            {[
              {
                icon: Stethoscope,
                label: "Doctor",
                value: `Dr. ${appointment.doctors.full_name} — ${appointment.doctors.specialization}`,
              },
              {
                icon: CalendarDays,
                label: "Date",
                value: new Date(
                  appointment.appointment_date
                ).toLocaleDateString("en-US", {
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
              ...(appointment.doctors.phone
                ? [
                    {
                      icon: Phone,
                      label: "Clinic Phone",
                      value: appointment.doctors.phone,
                    },
                  ]
                : []),
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 px-6 py-4"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-light)" }}
                >
                  <item.icon size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <span className="mt-1 text-xs text-gray-400">
                    {item.label}
                  </span>
                  <span
                    className="text-right text-sm font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}

            {/* Payment row */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-light)" }}
                >
                  <CreditCard size={14} style={{ color: "var(--primary)" }} />
                </div>
                <span className="text-xs text-gray-400">Amount Paid</span>
              </div>
              <span
                className="font-display text-xl font-bold"
                style={{ color: "#059669" }}
              >
                PKR {appointment.consultation_fee.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        {isConfirmed && (
          <div
            className="rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Bell size={16} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                What's Next?
              </p>
            </div>
            <ul className="space-y-3">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600">{step}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/appointments"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <LayoutDashboard size={15} /> View My Appointments
          </Link>
          <Link
            href="/doctors"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold transition-all hover:bg-gray-50"
            style={{
              borderColor: "var(--primary-light)",
              color: "var(--text-dark)",
            }}
          >
            <Search size={15} /> Book Another
          </Link>
        </div>

        {/* Support */}
        <p className="text-center text-xs text-gray-400">
          Need help?{" "}
          <a
            href="mailto:support@apnadoctor.pk"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            support@apnadoctor.pk
          </a>
        </p>
      </div>
    </div>
  );
}
