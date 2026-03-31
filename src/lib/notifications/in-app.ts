import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS, server-side only
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type InAppNotificationType =
  | "appointment_confirmed"
  | "appointment_booked"
  | "appointment_cancelled"
  | "appointment_status_changed"
  | "payment_received"
  | "appointment_reminder";

interface CreateNotificationParams {
  userId: string;
  type: InAppNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function createInAppNotification(
  params: CreateNotificationParams
): Promise<void> {
  const { error } = await adminSupabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data ?? null,
  });

  if (error) {
    console.error("[in-app notification] Insert failed:", error);
  }
}

/**
 * Fired when a patient's payment succeeds and appointment is confirmed.
 * Creates two notifications: one for the patient, one for the doctor.
 */
export async function notifyAppointmentConfirmed(appointmentId: string) {
  const { data: appt, error } = await adminSupabase
    .from("appointments")
    .select("*, doctors(id, full_name)")
    .eq("id", appointmentId)
    .single();

  if (error || !appt) {
    console.error("[in-app] notifyAppointmentConfirmed: appointment not found");
    return;
  }

  const formattedDate = new Date(appt.appointment_date).toLocaleDateString(
    "en-PK",
    { weekday: "short", month: "short", day: "numeric" }
  );

  // Notify patient
  await createInAppNotification({
    userId: appt.user_id,
    type: "appointment_confirmed",
    title: "Appointment Confirmed",
    message: `Your appointment with Dr. ${appt.doctors.full_name} on ${formattedDate} at ${appt.appointment_time} is confirmed.`,
    data: {
      appointmentId,
      doctorId: appt.doctor_id,
      doctorName: appt.doctors.full_name,
      appointmentDate: appt.appointment_date,
      appointmentTime: appt.appointment_time,
      bookingReference: appt.booking_reference,
    },
  });

  // Notify doctor
  await createInAppNotification({
    userId: appt.doctor_id,
    type: "appointment_booked",
    title: "New Appointment Booked",
    message: `${appt.patient_name} has booked an appointment on ${formattedDate} at ${appt.appointment_time}.`,
    data: {
      appointmentId,
      userId: appt.user_id,
      patientName: appt.patient_name,
      appointmentDate: appt.appointment_date,
      appointmentTime: appt.appointment_time,
      bookingReference: appt.booking_reference,
      fee: appt.consultation_fee,
    },
  });
}

/**
 * Fired when a doctor updates appointment status (confirmed, cancelled, completed, no_show).
 */
export async function notifyAppointmentStatusChanged(
  appointmentId: string,
  newStatus: string
) {
  const { data: appt, error } = await adminSupabase
    .from("appointments")
    .select("*, doctors(id, full_name)")
    .eq("id", appointmentId)
    .single();

  if (error || !appt) {
    console.error("[in-app] notifyAppointmentStatusChanged: appointment not found");
    return;
  }

  const formattedDate = new Date(appt.appointment_date).toLocaleDateString(
    "en-PK",
    { weekday: "short", month: "short", day: "numeric" }
  );

  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Appointment Confirmed by Doctor",
      message: `Dr. ${appt.doctors.full_name} confirmed your appointment on ${formattedDate} at ${appt.appointment_time}.`,
    },
    cancelled: {
      title: "Appointment Cancelled",
      message: `Your appointment with Dr. ${appt.doctors.full_name} on ${formattedDate} has been cancelled.`,
    },
    completed: {
      title: "Appointment Completed",
      message: `Your appointment with Dr. ${appt.doctors.full_name} on ${formattedDate} has been marked as completed.`,
    },
    no_show: {
      title: "Appointment Marked as No-Show",
      message: `Your appointment with Dr. ${appt.doctors.full_name} on ${formattedDate} was marked as no-show.`,
    },
  };

  const notif = statusMessages[newStatus];
  if (!notif) return;

  const type: InAppNotificationType =
    newStatus === "cancelled" ? "appointment_cancelled" : "appointment_status_changed";

  // Notify patient
  await createInAppNotification({
    userId: appt.user_id,
    type,
    title: notif.title,
    message: notif.message,
    data: {
      appointmentId,
      doctorId: appt.doctor_id,
      doctorName: appt.doctors.full_name,
      appointmentDate: appt.appointment_date,
      appointmentTime: appt.appointment_time,
      newStatus,
    },
  });
}
