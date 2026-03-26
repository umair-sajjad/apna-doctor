"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  CalendarDays,
  Clock,
  Stethoscope,
  CreditCard,
} from "lucide-react";
import StripePayment from "@/components/payment/StripePayment";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface AppointmentInfo {
  id: string;
  booking_reference: string;
  appointment_date: string;
  appointment_time: string;
  consultation_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  doctors: {
    full_name: string;
    specialization: string;
    clinic_name: string;
  };
}

export default function PayAppointmentPage({ params }: PageProps) {
  const router = useRouter();
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    params.then(({ id }) => setAppointmentId(id));
  }, [params]);

  useEffect(() => {
    if (!appointmentId) return;
    async function init() {
      try {
        const apptRes = await fetch("/api/appointments");
        const apptData = await apptRes.json();
        const appt = apptData.appointments?.find(
          (a: AppointmentInfo) => a.id === appointmentId
        );
        if (!appt) {
          setError("Appointment not found.");
          setLoading(false);
          return;
        }
        if (appt.status === "cancelled") {
          setError(
            "This appointment has been cancelled (payment window expired)."
          );
          setLoading(false);
          return;
        }
        if (appt.payment_status === "completed") {
          router.replace("/appointments");
          return;
        }
        setAppointment(appt);
        const elapsed = Date.now() - new Date(appt.created_at).getTime();
        setSecondsLeft(
          Math.max(0, Math.floor((30 * 60 * 1000 - elapsed) / 1000))
        );
        const piRes = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId }),
        });
        const piData = await piRes.json();
        if (!piRes.ok) {
          setError(piData.error || "Failed to initialise payment.");
          setLoading(false);
          return;
        }
        setPaymentData({
          clientSecret: piData.clientSecret,
          paymentIntentId: piData.paymentIntentId,
        });
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [appointmentId, router]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          clearInterval(timer);
          setError(
            "Payment window expired. This appointment has been cancelled."
          );
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  function formatCountdown(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  const isUrgent = secondsLeft !== null && secondsLeft < 300 && secondsLeft > 0;

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg-soft)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "var(--accent)",
                borderRightColor: "var(--accent)",
              }}
            />
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 44 44" fill="none">
                <rect x="19" y="6" width="6" height="32" rx="3" fill="white" />
                <rect x="6" y="19" width="32" height="6" rx="3" fill="white" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-400">Preparing your payment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: "var(--bg-soft)" }}
      >
        <div
          className="w-full max-w-md overflow-hidden rounded-3xl bg-white text-center"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div
            className="relative overflow-hidden px-8 py-10"
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
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle size={24} style={{ color: "#ef4444" }} />
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              {error}
            </h2>
          </div>
          <div className="p-6">
            <Link
              href="/appointments"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-xl items-center px-4">
          <Link
            href="/appointments"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={15} /> Back to Appointments
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-4 px-4 py-10">
        {/* Countdown banner */}
        {secondsLeft !== null && secondsLeft > 0 && (
          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium ${isUrgent ? "animate-pulse" : ""}`}
            style={
              isUrgent
                ? {
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                  }
                : {
                    background: "#fef9c3",
                    border: "1px solid #fde047",
                    color: "#a16207",
                  }
            }
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>
              Complete payment within{" "}
              <span className="text-lg font-bold tabular-nums">
                {formatCountdown(secondsLeft)}
              </span>{" "}
              or this slot will be released.
            </span>
          </div>
        )}

        {/* Appointment summary */}
        {appointment && (
          <div
            className="overflow-hidden rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
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
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(14,165,233,0.15)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <Stethoscope size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">
                      Dr. {appointment.doctors.full_name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {appointment.doctors.specialization}
                    </p>
                  </div>
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

            <div
              className="divide-y p-0"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
                {
                  icon: CalendarDays,
                  label: "Date",
                  value: new Date(
                    appointment.appointment_date
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
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
                  className="flex items-center gap-4 px-6 py-4"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <item.icon size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderColor: "var(--primary-light)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <CreditCard size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <span className="text-xs text-gray-400">
                    Consultation Fee
                  </span>
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
        )}

        {/* Stripe form */}
        {paymentData && appointment && (
          <div
            className="rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <p
              className="mb-4 text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Secure Payment
            </p>
            <StripePayment
              clientSecret={paymentData.clientSecret}
              appointmentId={appointment.id}
              bookingReference={appointment.booking_reference}
            />
          </div>
        )}
      </div>
    </div>
  );
}
