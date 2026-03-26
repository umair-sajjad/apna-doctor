import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/payments/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    // Get appointment details (must belong to this user)
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`*, doctors(full_name, specialization)`)
      .eq("id", appointmentId)
      .eq("user_id", user.id) // ownership check
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Guard: already paid
    if (appointment.payment_status === "completed") {
      return NextResponse.json(
        { error: "Appointment already paid" },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      appointment.consultation_fee,
      appointment.id,
      {
        patientName: appointment.patient_name,
        patientEmail: appointment.patient_email,
        doctorName: appointment.doctors.full_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
      }
    );

    // Update appointment with payment intent ID + mark pending
    await supabase
      .from("appointments")
      .update({
        transaction_id: paymentIntent.id,
        payment_status: "pending",
      })
      .eq("id", appointmentId);

    // Insert payment transaction record (audit trail)
    // Use upsert so retries don't fail on the unique PI constraint
    const { error: txError } = await supabase
      .from("payment_transactions")
      .upsert(
        {
          appointment_id: appointmentId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: appointment.consultation_fee,
          currency: "pkr",
          status: "pending",
          stripe_status: paymentIntent.status,
          metadata: {
            patient_name: appointment.patient_name,
            doctor_name: appointment.doctors.full_name,
          },
        },
        { onConflict: "stripe_payment_intent_id" }
      );

    if (txError) {
      // Non-fatal: log but don't block the payment flow
      console.error("Failed to insert payment_transaction record:", txError);
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
