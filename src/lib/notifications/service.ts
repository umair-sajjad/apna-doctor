import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./email";
import { sendSMS } from "./sms";
import {
  appointmentConfirmationEmail,
  appointmentReminderEmail,
} from "./templates/email";
import {
  appointmentConfirmationSMS,
  appointmentReminderSMS,
  appointmentCancelledSMS,
} from "./templates/sms";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendAppointmentConfirmation(appointmentId: string) {
  try {
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(
        "*, doctors(full_name, specialization, clinic_name, clinic_address)"
      )
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error("Appointment not found");
    }

    const formattedDate = new Date(
      appointment.appointment_date
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send Email
    const emailTemplate = appointmentConfirmationEmail({
      patientName: appointment.patient_name,
      doctorName: appointment.doctors.full_name,
      specialization: appointment.doctors.specialization,
      appointmentDate: formattedDate,
      appointmentTime: appointment.appointment_time,
      clinicName: appointment.doctors.clinic_name,
      clinicAddress: appointment.doctors.clinic_address,
      bookingReference: appointment.booking_reference,
      consultationFee: appointment.consultation_fee,
    });

    const emailResult = await sendEmail({
      to: appointment.patient_email,
      subject: "Appointment Confirmed - ApnaDoctor",
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    // Send SMS
    const smsText = appointmentConfirmationSMS({
      doctorName: appointment.doctors.full_name,
      appointmentDate: formattedDate,
      appointmentTime: appointment.appointment_time,
      clinicName: appointment.doctors.clinic_name,
      bookingReference: appointment.booking_reference,
    });

    const smsResult = await sendSMS({
      to: appointment.patient_phone,
      message: smsText,
    });

    // Log notification
    await supabase.from("notification_log").insert({
      appointment_id: appointmentId,
      notification_type: "confirmation",
      channel: "email_sms",
      recipient_email: appointment.patient_email,
      recipient_phone: appointment.patient_phone,
      status: emailResult.success && smsResult.success ? "sent" : "failed",
      error_message: !emailResult.success
        ? JSON.stringify(emailResult.error)
        : !smsResult.success
          ? JSON.stringify(smsResult.error)
          : null,
      sent_at: new Date().toISOString(),
    });

    return {
      success: emailResult.success && smsResult.success,
      email: emailResult,
      sms: smsResult,
    };
  } catch (error) {
    console.error("Send confirmation error:", error);

    // Log failure
    await supabase.from("notification_log").insert({
      appointment_id: appointmentId,
      notification_type: "confirmation",
      channel: "email_sms",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      sent_at: new Date().toISOString(),
    });

    return { success: false, error };
  }
}

export async function sendAppointmentReminder(
  appointmentId: string,
  hoursUntil: number
) {
  try {
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*, doctors(full_name, clinic_name, clinic_address)")
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error("Appointment not found");
    }

    const emailTemplate = appointmentReminderEmail(
      {
        patientName: appointment.patient_name,
        doctorName: appointment.doctors.full_name,
        appointmentTime: appointment.appointment_time,
        clinicName: appointment.doctors.clinic_name,
        clinicAddress: appointment.doctors.clinic_address,
      },
      hoursUntil
    );

    const emailResult = await sendEmail({
      to: appointment.patient_email,
      subject: `Reminder: Appointment ${hoursUntil === 0 ? "Now" : `in ${hoursUntil} Hours`}`,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    const smsText = appointmentReminderSMS(
      {
        doctorName: appointment.doctors.full_name,
        appointmentTime: appointment.appointment_time,
        clinicAddress: appointment.doctors.clinic_address,
      },
      hoursUntil
    );

    const smsResult = await sendSMS({
      to: appointment.patient_phone,
      message: smsText,
    });

    await supabase.from("notification_log").insert({
      appointment_id: appointmentId,
      notification_type:
        hoursUntil === 0 ? "at_time_reminder" : "2_hour_reminder",
      channel: "email_sms",
      recipient_email: appointment.patient_email,
      recipient_phone: appointment.patient_phone,
      status: emailResult.success && smsResult.success ? "sent" : "failed",
      error_message: !emailResult.success
        ? JSON.stringify(emailResult.error)
        : !smsResult.success
          ? JSON.stringify(smsResult.error)
          : null,
      sent_at: new Date().toISOString(),
    });

    return {
      success: emailResult.success && smsResult.success,
      email: emailResult,
      sms: smsResult,
    };
  } catch (error) {
    console.error("Send reminder error:", error);
    return { success: false, error };
  }
}

export async function sendCancellationNotification(
  appointmentId: string,
  refundAmount: number
) {
  try {
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*, doctors(full_name)")
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error("Appointment not found");
    }

    const smsText = appointmentCancelledSMS({
      doctorName: appointment.doctors.full_name,
      refundAmount,
    });

    const smsResult = await sendSMS({
      to: appointment.patient_phone,
      message: smsText,
    });

    await supabase.from("notification_log").insert({
      appointment_id: appointmentId,
      notification_type: "cancellation",
      channel: "sms",
      recipient_phone: appointment.patient_phone,
      status: smsResult.success ? "sent" : "failed",
      error_message: !smsResult.success
        ? JSON.stringify(smsResult.error)
        : null,
      sent_at: new Date().toISOString(),
    });

    return smsResult;
  } catch (error) {
    console.error("Send cancellation error:", error);
    return { success: false, error };
  }
}
