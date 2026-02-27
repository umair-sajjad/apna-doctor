import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AppointmentActions from "./AppointmentActions";

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

  if (!user) {
    redirect("/login");
  }

  // Get appointment
  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, users(full_name, phone, email)")
    .eq("id", id)
    .eq("doctor_id", user.id)
    .single();

  if (!appointment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/doctor/appointments" className="text-blue-600">
            ← Back to Appointments
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Appointment Details</h2>
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              appointment.status === "completed"
                ? "bg-green-100 text-green-800"
                : appointment.status === "confirmed"
                  ? "bg-blue-100 text-blue-800"
                  : appointment.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Appointment Info */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Name:</strong>{" "}
                  {appointment.users?.full_name || appointment.patient_name}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {appointment.users?.phone || appointment.patient_phone}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {appointment.users?.email || appointment.patient_email}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Appointment Information</h3>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.appointment_date).toLocaleDateString(
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
                  <strong>Time:</strong> {appointment.appointment_time}
                </p>
                <p>
                  <strong>Duration:</strong> {appointment.duration} minutes
                </p>
                <p>
                  <strong>Booking Reference:</strong>{" "}
                  {appointment.booking_reference}
                </p>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          {appointment.chief_complaint && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Chief Complaint</h3>
              <p className="mt-2">{appointment.chief_complaint}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Consultation Fee:</strong> PKR{" "}
                {appointment.consultation_fee}
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  className={`font-medium ${
                    appointment.payment_status === "completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {appointment.payment_status}
                </span>
              </p>
              {appointment.payment_method && (
                <p>
                  <strong>Payment Method:</strong> {appointment.payment_method}
                </p>
              )}
            </div>
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
  );
}
