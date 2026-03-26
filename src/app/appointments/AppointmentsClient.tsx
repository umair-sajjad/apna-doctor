"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  Search,
  ChevronRight,
} from "lucide-react";

interface Doctor {
  full_name: string;
  specialization: string;
  clinic_name: string;
  clinic_address: string;
  phone: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  booking_reference: string;
  consultation_fee: number;
  created_at: string;
  doctors: Doctor;
}

function useCountdown(createdAt: string) {
  const getSecondsLeft = useCallback(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor((30 * 60 * 1000 - elapsed) / 1000));
  }, [createdAt]);

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      const s = getSecondsLeft();
      setSecondsLeft(s);
      if (s <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [getSecondsLeft, secondsLeft]);

  return secondsLeft;
}

function CountdownBadge({ createdAt }: { createdAt: string }) {
  const s = useCountdown(createdAt);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (s <= 0)
    return (
      <span className="text-xs font-medium text-red-500">Slot expired</span>
    );
  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold ${s < 300 ? "text-red-600" : "text-yellow-700"}`}
    >
      <Clock size={11} />
      Pay within {m}:{String(sec).padStart(2, "0")}
    </span>
  );
}

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
  pending: { bg: "#fef9c3", color: "#a16207", label: "Awaiting Payment" },
};

const TABS = ["upcoming", "past", "cancelled"] as const;
type Tab = (typeof TABS)[number];

export default function AppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isPendingPayment = (apt: Appointment) =>
    apt.status === "pending" && apt.payment_status === "pending";

  const upcoming = appointments.filter(
    (a) =>
      (a.status === "confirmed" || a.status === "pending") &&
      new Date(a.appointment_date) >= new Date()
  );
  const past = appointments.filter(
    (a) =>
      a.status === "completed" ||
      (new Date(a.appointment_date) < new Date() && a.status !== "cancelled")
  );
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  const lists: Record<Tab, Appointment[]> = { upcoming, past, cancelled };
  const displayed = lists[activeTab];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
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
              Health Activity
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
              My Appointments
            </h1>
          </div>
          <Link
            href="/doctors"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 sm:mt-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <Search size={15} /> Find a Doctor
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex rounded-xl p-1"
        style={{
          background: "white",
          border: "1px solid var(--primary-light)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold capitalize transition-all"
            style={
              activeTab === tab
                ? {
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                    color: "white",
                  }
                : { color: "rgba(0,0,0,0.45)" }
            }
          >
            {tab}
            <span
              className="rounded-full px-1.5 py-0.5 text-xs"
              style={
                activeTab === tab
                  ? { background: "rgba(255,255,255,0.25)", color: "white" }
                  : { background: "var(--bg-soft)", color: "var(--text-dark)" }
              }
            >
              {lists[tab].length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl"
              style={{
                background: "white",
                border: "1px solid var(--primary-light)",
              }}
            />
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className="space-y-4">
          {displayed.map((apt) => {
            const awaitingPayment = isPendingPayment(apt);
            const statusStyle =
              STATUS_STYLES[awaitingPayment ? "pending" : apt.status] ??
              STATUS_STYLES.pending;

            return (
              <div
                key={apt.id}
                className="overflow-hidden rounded-2xl bg-white transition-all hover:shadow-md"
                style={{
                  border: awaitingPayment
                    ? "1px solid #fde047"
                    : "1px solid var(--primary-light)",
                }}
              >
                {awaitingPayment && (
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium"
                    style={{ background: "#fef9c3", color: "#a16207" }}
                  >
                    <AlertCircle size={13} />
                    Payment pending — slot reserved but not confirmed yet.
                  </div>
                )}

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <Stethoscope
                        size={20}
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-display font-bold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        Dr. {apt.doctors.full_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {apt.doctors.specialization}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarDays size={11} />
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
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} />
                          {apt.appointment_time}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} />
                          {apt.doctors.clinic_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {statusStyle.label}
                    </span>

                    {awaitingPayment && (
                      <>
                        <CountdownBadge createdAt={apt.created_at} />
                        <Link
                          href={`/appointments/${apt.id}/pay`}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{
                            background:
                              "linear-gradient(135deg, #059669, #10b981)",
                          }}
                        >
                          <CreditCard size={13} />
                          Pay — PKR {apt.consultation_fee.toLocaleString()}
                        </Link>
                      </>
                    )}

                    <Link
                      href={`/appointments/${apt.id}`}
                      className="flex items-center gap-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-blue-50"
                      style={{
                        borderColor: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
            No {activeTab} appointments
          </p>
          {activeTab === "upcoming" && (
            <Link
              href="/doctors"
              className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              Find a Doctor
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
