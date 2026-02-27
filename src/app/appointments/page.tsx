"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  booking_reference: string;
  doctors: Doctor;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments
  const upcoming = appointments.filter(
    (apt) =>
      (apt.status === "confirmed" || apt.status === "pending") &&
      new Date(apt.appointment_date) >= new Date()
  );

  const past = appointments.filter(
    (apt) =>
      apt.status === "completed" ||
      (new Date(apt.appointment_date) < new Date() &&
        apt.status !== "cancelled")
  );

  const cancelled = appointments.filter((apt) => apt.status === "cancelled");

  const displayedAppointments =
    activeTab === "upcoming"
      ? upcoming
      : activeTab === "past"
        ? past
        : cancelled;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ApnaDoctor
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-gray-600">
                Dashboard
              </Link>
              <Link href="/appointments" className="font-medium text-blue-600">
                My Appointments
              </Link>
              <Link href="/doctors" className="text-gray-600">
                Find Doctors
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">My Appointments</h2>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-4 text-sm font-medium ${
                activeTab === "upcoming"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-4 text-sm font-medium ${
                activeTab === "past"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Past ({past.length})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`pb-4 text-sm font-medium ${
                activeTab === "cancelled"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Cancelled ({cancelled.length})
            </button>
          </nav>
        </div>

        {/* Appointments List */}
        <div className="mt-6 space-y-4">
          {displayedAppointments.length > 0 ? (
            displayedAppointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                      👨‍⚕️
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black">
                        Dr. {apt.doctors.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {apt.doctors.specialization}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-black">
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p>
                          <strong>Time:</strong> {apt.appointment_time}
                        </p>
                        <p>
                          <strong>Clinic:</strong> {apt.doctors.clinic_name}
                        </p>
                        <p className="text-gray-600">
                          {apt.doctors.clinic_address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {apt.status}
                    </span>
                    <Link
                      href={`/appointments/${apt.id}`}
                      className="rounded-md border border-blue-600 px-4 py-2 text-center text-sm text-blue-600 hover:bg-blue-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">
                {activeTab === "upcoming" && "No upcoming appointments"}
                {activeTab === "past" && "No past appointments"}
                {activeTab === "cancelled" && "No cancelled appointments"}
              </p>
              {activeTab === "upcoming" && (
                <Link
                  href="/doctors"
                  className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  Find a Doctor
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
