import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReviewForm from "./ReviewForm";

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

  if (!user) {
    redirect("/login");
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, doctors(full_name, specialization, clinic_name, clinic_address, phone)"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!appointment) {
    notFound();
  }

  // Check if review exists
  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("appointment_id", id)
    .single();

  const canReview = appointment.status === "completed" && !review;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/appointments" className="text-blue-600">
            ← Back to Appointments
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-black">Appointment Details</h2>
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
              <h3 className="text-lg font-semibold text-black">
                Doctor Information
              </h3>
              <div className="mt-4 space-y-2 text-black">
                <p>
                  <strong>Name:</strong> Dr. {appointment.doctors.full_name}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {appointment.doctors.specialization}
                </p>
                <p>
                  <strong>Phone:</strong> {appointment.doctors.phone}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black">
                Appointment Information
              </h3>
              <div className="mt-4 space-y-2 text-black">
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
                  <strong>Booking Reference:</strong>{" "}
                  {appointment.booking_reference}
                </p>
              </div>
            </div>
          </div>

          {/* Clinic Info */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-black">
              Clinic Information
            </h3>
            <div className="mt-4 space-y-2 text-black">
              <p>
                <strong>Name:</strong> {appointment.doctors.clinic_name}
              </p>
              <p>
                <strong>Address:</strong> {appointment.doctors.clinic_address}
              </p>
            </div>
          </div>

          {/* Chief Complaint */}
          {appointment.chief_complaint && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-black">
                Chief Complaint
              </h3>
              <p className="mt-2 text-black">{appointment.chief_complaint}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-black">
              Payment Information
            </h3>
            <div className="mt-4 space-y-2 text-black">
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
            </div>
          </div>
        </div>

        {/* Existing Review */}
        {review && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-black">Your Review</h3>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">
                  {"⭐".repeat(review.rating)}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.review_text && (
                <p className="mt-2 text-black">{review.review_text}</p>
              )}
            </div>
          </div>
        )}

        {/* Review Form */}
        {canReview && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-black">
              Rate Your Experience
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Help other patients by sharing your experience
            </p>
            <ReviewForm appointmentId={appointment.id} />
          </div>
        )}
      </div>
    </div>
  );
}
