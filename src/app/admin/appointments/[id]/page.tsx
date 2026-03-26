import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  CreditCard,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import AppointmentActions from "./AppointmentActions";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: appointment } = await adminSupabase
    .from("appointments")
    .select(`*, doctors(full_name, specialization, email, phone, clinic_name, city), users(full_name, email, phone)`)
    .eq("id", id)
    .single();

  if (!appointment) notFound();

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const paymentColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/appointments"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Detail
          </h1>
          <p className="text-sm text-gray-500 font-mono">
            {appointment.booking_reference}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Appointment Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(appointment.appointment_date).toLocaleDateString("en-PK", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {appointment.appointment_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{appointment.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    statusColors[appointment.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              {appointment.chief_complaint && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Chief Complaint</p>
                  <p className="font-medium text-gray-900 flex items-start gap-1">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {appointment.chief_complaint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{appointment.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {appointment.patient_phone}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {appointment.patient_email}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              Doctor Information
            </h2>
            {appointment.doctors ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">Dr. {appointment.doctors.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="font-medium text-gray-900">{appointment.doctors.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clinic</p>
                  <p className="font-medium text-gray-900">{appointment.doctors.clinic_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium text-gray-900">{appointment.doctors.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{appointment.doctors.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{appointment.doctors.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Doctor info unavailable</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Consultation Fee</span>
                <span className="font-semibold text-green-600">
                  PKR {appointment.consultation_fee.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Payment Status</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    paymentColors[appointment.payment_status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {appointment.payment_status === "completed" ? "Paid" : appointment.payment_status}
                </span>
              </div>
              {appointment.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="text-sm font-medium capitalize text-gray-900">
                    {appointment.payment_method}
                  </span>
                </div>
              )}
              {appointment.transaction_id && (
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-gray-700">
                    {appointment.transaction_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">
                  {new Date(appointment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">
                  {new Date(appointment.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <AppointmentActions
            appointmentId={appointment.id}
            currentStatus={appointment.status}
          />
        </div>
      </div>
    </div>
  );
}
