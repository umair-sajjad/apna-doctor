import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentConfirmation } from "@/lib/notifications/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      patientName,
      patientPhone,
      patientEmail,
      chiefComplaint,
    } = body;

    // Validate required fields
    if (
      !doctorId ||
      !appointmentDate ||
      !appointmentTime ||
      !patientName ||
      !patientPhone ||
      !patientEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("consultation_fee")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check if slot is available
    const { data: existingAppointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .in("status", ["pending", "confirmed"])
      .single();

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Generate booking reference
    const bookingReference = `APT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        doctor_id: doctorId,
        user_id: user.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        booking_reference: bookingReference,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_email: patientEmail,
        chief_complaint: chiefComplaint || null,
        consultation_fee: doctor.consultation_fee,
        status: "confirmed",
        payment_status: "completed",
      })
      .select()
      .single();

    if (appointmentError) {
      console.error("Appointment creation error:", appointmentError);
      return NextResponse.json(
        { error: "Failed to create appointment" },
        { status: 500 }
      );
    }

    // Send confirmation notifications asynchronously (don't wait for it)
    sendAppointmentConfirmation(appointment.id).catch((err) => {
      console.error("Failed to send confirmation notification:", err);
      // Log error but don't fail the appointment creation
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Appointment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's appointments
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*, doctors(full_name, specialization)")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
