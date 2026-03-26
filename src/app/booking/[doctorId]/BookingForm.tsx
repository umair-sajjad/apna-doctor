"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Loader2,
  User,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import StripePayment from "@/components/payment/StripePayment";

interface AvailabilityRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

interface BookedSlot {
  appointment_date: string;
  appointment_time: string;
}

interface UserProfile {
  full_name: string;
  phone: string;
  email: string;
}

interface BookingFormProps {
  doctor: any;
  availability: AvailabilityRow[];
  bookedSlots: BookedSlot[];
  userProfile: UserProfile | null;
}

interface PaymentData {
  clientSecret: string;
  appointmentId: string;
  bookingReference: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (current + duration <= endMinutes) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += duration;
  }
  return slots;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingForm({
  doctor,
  availability,
  bookedSlots,
  userProfile,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const availableDays = useMemo(
    () => new Set(availability.map((a) => a.day_of_week)),
    [availability]
  );

  const bookedMap = useMemo(() => {
    const m = new Set<string>();
    for (const b of bookedSlots)
      m.add(`${b.appointment_date}:${b.appointment_time}`);
    return m;
  }, [bookedSlots]);

  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dow = new Date(selectedDate + "T00:00:00").getDay();
    const blocks = availability.filter((a) => a.day_of_week === dow);
    const all: string[] = [];
    for (const block of blocks)
      all.push(
        ...generateSlots(block.start_time, block.end_time, block.slot_duration)
      );
    return all.filter((t) => !bookedMap.has(`${selectedDate}:${t}`));
  }, [selectedDate, availability, bookedMap]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const daysInMonth = new Date(
    calendarDate.year,
    calendarDate.month + 1,
    0
  ).getDate();
  const firstDay = new Date(calendarDate.year, calendarDate.month, 1).getDay();

  function isDaySelectable(year: number, month: number, day: number) {
    const date = new Date(year, month, day);
    if (date < today || date > maxDate) return false;
    return availableDays.has(date.getDay());
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const apptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          patientName: formData.get("patientName"),
          patientEmail: formData.get("patientEmail"),
          patientPhone: formData.get("patientPhone"),
          chiefComplaint: formData.get("chiefComplaint"),
        }),
      });
      const apptData = await apptRes.json();
      if (!apptRes.ok) throw new Error(apptData.error || "Booking failed");

      const paymentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: apptData.appointment.id }),
      });
      const paymentJson = await paymentRes.json();
      if (!paymentRes.ok)
        throw new Error(paymentJson.error || "Payment setup failed");

      setPaymentData({
        clientSecret: paymentJson.clientSecret,
        appointmentId: apptData.appointment.id,
        bookingReference: apptData.appointment.booking_reference,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Payment step ────────────────────────────────────────────────────
  if (paymentData) {
    return (
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}
        >
          <CheckCircle2 size={20} style={{ color: "#059669" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#059669" }}>
              Slot reserved!
            </p>
            <p className="text-xs" style={{ color: "#065f46" }}>
              Complete payment within 30 minutes to confirm your booking.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div
          className="rounded-2xl bg-white p-6"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <p
            className="mb-4 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Booking Summary
          </p>
          <div className="space-y-3">
            {[
              { label: "Doctor", value: `Dr. ${doctor.full_name}` },
              {
                label: "Date",
                value: new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                ),
              },
              { label: "Time", value: formatTime(selectedTime) },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-gray-400">{row.label}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
            <div
              className="flex items-center justify-between border-t pt-3"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <span className="text-xs font-semibold text-gray-500">Total</span>
              <span
                className="font-display text-xl font-bold"
                style={{ color: "#059669" }}
              >
                PKR {doctor.consultation_fee.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

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
            appointmentId={paymentData.appointmentId}
            bookingReference={paymentData.bookingReference}
          />
        </div>
      </div>
    );
  }

  // ── No availability ─────────────────────────────────────────────────
  if (availability.length === 0) {
    return (
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
          No availability set
        </p>
        <p className="mt-2 max-w-xs text-xs text-gray-400">
          This doctor hasn't set their schedule yet. Please try again later or
          contact the clinic directly.
        </p>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Calendar */}
      <div
        className="rounded-2xl bg-white p-6"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={16} style={{ color: "var(--primary)" }} />
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Select Date
          </p>
        </div>

        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setCalendarDate((p) =>
                p.month === 0
                  ? { year: p.year - 1, month: 11 }
                  : { ...p, month: p.month - 1 }
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span
            className="font-display text-sm font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            {MONTH_NAMES[calendarDate.month]} {calendarDate.year}
          </span>
          <button
            type="button"
            onClick={() =>
              setCalendarDate((p) =>
                p.month === 11
                  ? { year: p.year + 1, month: 0 }
                  : { ...p, month: p.month + 1 }
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-1 text-xs font-semibold text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateString(
              calendarDate.year,
              calendarDate.month,
              day
            );
            const selectable = isDaySelectable(
              calendarDate.year,
              calendarDate.month,
              day
            );
            const isSelected = selectedDate === dateStr;
            const isToday =
              toDateString(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              ) === dateStr;

            return (
              <button
                key={day}
                type="button"
                disabled={!selectable}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedTime("");
                }}
                className="rounded-xl py-2.5 text-sm font-medium transition-all"
                style={
                  isSelected
                    ? {
                        background:
                          "linear-gradient(135deg, var(--primary), var(--accent))",
                        color: "white",
                      }
                    : selectable
                      ? isToday
                        ? {
                            border: "1.5px solid var(--primary)",
                            color: "var(--primary)",
                          }
                        : { color: "var(--text-dark)" }
                      : { color: "#d1d5db", cursor: "not-allowed" }
                }
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {[
            {
              style: {
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
                borderRadius: "50%",
              },
              label: "Selected",
            },
            {
              style: {
                border: "1.5px solid var(--primary)",
                borderRadius: "4px",
                background: "transparent",
              },
              label: "Today",
            },
            {
              style: { background: "#e5e7eb", borderRadius: "50%" },
              label: "Unavailable",
            },
          ].map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 text-xs text-gray-400"
            >
              <span className="inline-block h-3 w-3" style={item.style} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div
          className="rounded-2xl bg-white p-6"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Clock size={16} style={{ color: "var(--primary)" }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Select Time —{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          {timeSlotsForDate.length === 0 ? (
            <div
              className="rounded-xl py-6 text-center text-sm"
              style={{ background: "#fef9c3", color: "#a16207" }}
            >
              No available slots on this date. Please select another day.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {timeSlotsForDate.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className="rounded-xl border py-2.5 text-xs font-semibold transition-all"
                  style={
                    selectedTime === slot
                      ? {
                          background:
                            "linear-gradient(135deg, var(--primary), var(--accent))",
                          color: "white",
                          border: "none",
                        }
                      : {
                          borderColor: "var(--primary-light)",
                          color: "var(--text-dark)",
                        }
                  }
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patient details */}
      <div
        className="rounded-2xl bg-white p-6"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={16} style={{ color: "var(--primary)" }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Patient Information
            </p>
          </div>
          {userProfile && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: "#d1fae5", color: "#059669" }}
            >
              Auto-filled
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--text-dark)" }}
            >
              Full Name *
            </label>
            <input
              type="text"
              name="patientName"
              required
              defaultValue={userProfile?.full_name ?? ""}
              placeholder="Enter full name"
              className="w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--text-dark)" }}
              >
                Email *
              </label>
              <input
                type="email"
                name="patientEmail"
                required
                defaultValue={userProfile?.email ?? ""}
                placeholder="you@example.com"
                className="w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
                style={{
                  borderColor: "var(--primary-light)",
                  color: "var(--text-dark)",
                }}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--text-dark)" }}
              >
                Phone *
              </label>
              <input
                type="tel"
                name="patientPhone"
                required
                defaultValue={userProfile?.phone ?? ""}
                placeholder="03001234567"
                className="w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
                style={{
                  borderColor: "var(--primary-light)",
                  color: "var(--text-dark)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--text-dark)" }}
            >
              Reason for Visit *
            </label>
            <textarea
              name="chiefComplaint"
              rows={4}
              required
              placeholder="Describe your symptoms or reason for consultation…"
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
                background: "var(--bg-soft)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary + submit */}
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
            Booking Summary
          </p>
        </div>

        <div className="space-y-3">
          {[
            { label: "Doctor", value: `Dr. ${doctor.full_name}` },
            {
              label: "Date",
              value: selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "—",
            },
            {
              label: "Time",
              value: selectedTime ? formatTime(selectedTime) : "—",
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{row.label}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <span className="text-xs font-semibold text-gray-500">Total</span>
            <span
              className="font-display text-xl font-bold"
              style={{ color: "#059669" }}
            >
              PKR {doctor.consultation_fee.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedTime}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Processing…
            </>
          ) : (
            "Proceed to Payment"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          By booking you agree to our{" "}
          <a
            href="/terms"
            className="hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Terms of Service
          </a>
        </p>
      </div>
    </form>
  );
}
