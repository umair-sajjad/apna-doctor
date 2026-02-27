import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentReminder } from "@/lib/notifications/service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const authHeader = request.headers.get("authorization");
      const providedSecret = authHeader?.replace("Bearer ", "");

      if (providedSecret !== process.env.CRON_SECRET) {
        console.error("Unauthorized cron attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("⏰ Cron job started:", new Date().toISOString());

    const now = new Date();
    const results = {
      twoHourReminders: [] as any[],
      atTimeReminders: [] as any[],
      errors: [] as any[],
    };

    // ============================================
    // PART 1: Send 2-Hour Before Reminders
    // ============================================
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHoursWindow = {
      start: new Date(now.getTime() + 1.75 * 60 * 60 * 1000), // 1h 45m
      end: new Date(now.getTime() + 2.25 * 60 * 60 * 1000), // 2h 15m
    };

    console.log("🔍 Checking for 2-hour reminders...");

    // Get appointments happening in ~2 hours
    const { data: upcomingAppointments, error: upcomingError } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, patient_name")
      .eq("status", "confirmed")
      .gte("appointment_date", now.toISOString().split("T")[0])
      .lte("appointment_date", twoHoursLater.toISOString().split("T")[0]);

    if (upcomingError) {
      console.error("Error fetching upcoming appointments:", upcomingError);
      results.errors.push({ type: "fetch_upcoming", error: upcomingError });
    }

    // Filter appointments that are in the 2-hour window
    for (const appointment of upcomingAppointments || []) {
      const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );

      if (
        appointmentDateTime >= twoHoursWindow.start &&
        appointmentDateTime <= twoHoursWindow.end
      ) {
        // Check if we already sent 2-hour reminder
        const { data: existingLog } = await supabase
          .from("notification_log")
          .select("id")
          .eq("appointment_id", appointment.id)
          .eq("notification_type", "2_hour_reminder")
          .single();

        if (!existingLog) {
          console.log(
            `📧 Sending 2-hour reminder for: ${appointment.patient_name}`
          );
          const result = await sendAppointmentReminder(appointment.id, 2);
          results.twoHourReminders.push({
            appointmentId: appointment.id,
            patientName: appointment.patient_name,
            success: result.success,
          });
        } else {
          console.log(
            `⏭️ Already sent 2-hour reminder for: ${appointment.patient_name}`
          );
        }
      }
    }

    // ============================================
    // PART 2: Send At-Time Reminders
    // ============================================
    const currentTimeWindow = {
      start: new Date(now.getTime() - 7.5 * 60 * 1000), // 7.5 minutes ago
      end: new Date(now.getTime() + 7.5 * 60 * 1000), // 7.5 minutes from now
    };

    console.log("🔍 Checking for at-time reminders...");

    const { data: currentAppointments, error: currentError } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, patient_name")
      .eq("status", "confirmed")
      .eq("appointment_date", now.toISOString().split("T")[0]);

    if (currentError) {
      console.error("Error fetching current appointments:", currentError);
      results.errors.push({ type: "fetch_current", error: currentError });
    }

    for (const appointment of currentAppointments || []) {
      const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );

      if (
        appointmentDateTime >= currentTimeWindow.start &&
        appointmentDateTime <= currentTimeWindow.end
      ) {
        // Check if we already sent at-time reminder
        const { data: existingLog } = await supabase
          .from("notification_log")
          .select("id")
          .eq("appointment_id", appointment.id)
          .eq("notification_type", "at_time_reminder")
          .single();

        if (!existingLog) {
          console.log(
            `📧 Sending at-time reminder for: ${appointment.patient_name}`
          );
          const result = await sendAppointmentReminder(appointment.id, 0);
          results.atTimeReminders.push({
            appointmentId: appointment.id,
            patientName: appointment.patient_name,
            success: result.success,
          });
        } else {
          console.log(
            `⏭️ Already sent at-time reminder for: ${appointment.patient_name}`
          );
        }
      }
    }

    const summary = {
      timestamp: now.toISOString(),
      twoHourRemindersSent: results.twoHourReminders.length,
      atTimeRemindersSent: results.atTimeReminders.length,
      errors: results.errors.length,
      details: results,
    };

    console.log("✅ Cron job completed:", summary);

    return NextResponse.json({
      success: true,
      message: "Reminders processed successfully",
      summary,
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
