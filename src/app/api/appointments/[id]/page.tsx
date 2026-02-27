import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AppointmentConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, doctors(full_name, specialization, clinic_name, clinic_address, phone)"
    )
    .eq("id", params.id)
    .single();

  if (!appointment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ApnaDoctor
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-black">
            Appointment Confirmed!
          </h1>
          <p className="mt-2 text-gray-600">
            Your booking is confirmed. You will receive SMS and email reminders.
          </p>
        </div>

        {/* Appointment Details */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-xl font-bold text-black">
              {appointment.booking_reference}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Doctor</p>
              <p className="font-semibold text-black">
                Dr. {appointment.doctors.full_name}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.doctors.specialization}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-black">
                {new Date(appointment.appointment_date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}{" "}
                at {appointment.appointment_time}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Clinic</p>
              <p className="font-semibold text-black">
                {appointment.doctors.clinic_name}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.doctors.clinic_address}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-semibold text-black">
                {appointment.patient_name}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.patient_phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Consultation Fee</p>
              <p className="text-lg font-bold text-green-600">
                PKR {appointment.consultation_fee}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/appointments"
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 hover:bg-gray-50"
          >
            View All Appointments
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
