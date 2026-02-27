"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  full_name: string;
  consultation_fee: number;
}

interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

export default function BookingForm({
  doctor,
  user,
}: {
  doctor: Doctor;
  user: User | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate time slots (9 AM - 5 PM, 30 min intervals)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: formData.get("date"),
          appointmentTime: formData.get("time"),
          patientName: formData.get("patientName"),
          patientPhone: formData.get("patientPhone"),
          patientEmail: formData.get("patientEmail"),
          chiefComplaint: formData.get("chiefComplaint"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      router.push(`/appointments/${data.appointment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Date Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black">Select Date</h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {getNext7Days().map((date) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(date.toISOString().split("T")[0])}
              className={`rounded-lg border p-3 text-center ${
                selectedDate === date.toISOString().split("T")[0]
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-xs text-gray-500">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-semibold">{date.getDate()}</div>
              <div className="text-xs text-gray-500">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </div>
            </button>
          ))}
        </div>
        <input type="hidden" name="date" value={selectedDate} required />
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">Select Time</h3>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {getTimeSlots().map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border p-3 text-center ${
                  selectedTime === time
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <input type="hidden" name="time" value={selectedTime} required />
        </div>
      )}

      {/* Patient Information */}
      {selectedTime && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">
            Patient Information
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="patientName"
                defaultValue={user?.full_name || ""}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="patientPhone"
                defaultValue={user?.phone || ""}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="patientEmail"
                defaultValue={user?.email || ""}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chief Complaint (Why are you visiting?)
              </label>
              <textarea
                name="chiefComplaint"
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Describe your health concern..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit */}
      {selectedTime && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-black">
                PKR {doctor.consultation_fee}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
