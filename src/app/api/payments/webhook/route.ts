import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/payments/stripe";
import { sendAppointmentConfirmation } from "@/lib/notifications/service";
import { notifyAppointmentConfirmed } from "@/lib/notifications/in-app";
import { headers } from "next/headers";

// Service-role client bypasses RLS — safe for server-only webhook handler
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[webhook] No stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

  // ── Payment succeeded ───────────────────────────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const appointmentId = pi.metadata?.appointmentId;

    if (!appointmentId) {
      console.error("[webhook] No appointmentId in payment intent metadata");
      return NextResponse.json({ received: true });
    }

    console.log(`[webhook] Payment succeeded — appointment: ${appointmentId}`);

    // Fetch current state to decide whether to send notifications
    const { data: current } = await adminSupabase
      .from("appointments")
      .select("status, payment_status")
      .eq("id", appointmentId)
      .single();

    const alreadyConfirmed =
      current?.status === "confirmed" &&
      current?.payment_status === "completed";

    // Idempotent: update appointment regardless (safe to re-run)
    const { error: apptError } = await adminSupabase
      .from("appointments")
      .update({
        payment_status: "completed",
        payment_method: (pi.payment_method_types?.[0] as string) ?? "card",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (apptError) {
      console.error("[webhook] Failed to update appointment:", apptError);
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 }
      );
    }

    // Upsert transaction record
    await adminSupabase.from("payment_transactions").upsert(
      {
        appointment_id: appointmentId,
        stripe_payment_intent_id: pi.id,
        amount: Math.round((pi.amount_received ?? pi.amount) / 100), // cents → PKR
        currency: pi.currency ?? "pkr",
        status: "succeeded",
        stripe_status: pi.status,
        payment_method_type: (pi.payment_method_types?.[0] as string) ?? "card",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          amount_received: pi.amount_received,
          stripe_payment_method: pi.payment_method,
        },
      },
      { onConflict: "stripe_payment_intent_id" }
    );

    // Only send notifications once — skip if success page already did it
    if (!alreadyConfirmed) {
      try {
        await sendAppointmentConfirmation(appointmentId);
        console.log(`[webhook] Confirmation notifications sent`);
      } catch (notifError) {
        console.error("[webhook] Notification error (non-critical):", notifError);
      }

      try {
        await notifyAppointmentConfirmed(appointmentId);
        console.log(`[webhook] In-app notifications created`);
      } catch (inAppError) {
        console.error("[webhook] In-app notification error (non-critical):", inAppError);
      }
    } else {
      console.log(
        "[webhook] Appointment already confirmed by success page — skipping notifications"
      );
    }

    return NextResponse.json({
      received: true,
      message: "Appointment confirmed",
    });
  }

  // ── Payment failed ──────────────────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const appointmentId = pi.metadata?.appointmentId;

    if (!appointmentId) {
      return NextResponse.json({ received: true });
    }

    console.log(`[webhook] Payment failed — appointment: ${appointmentId}`);

    await adminSupabase
      .from("appointments")
      .update({
        payment_status: "failed",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    await adminSupabase.from("payment_transactions").upsert(
      {
        appointment_id: appointmentId,
        stripe_payment_intent_id: pi.id,
        amount: Math.round(pi.amount / 100),
        currency: pi.currency ?? "pkr",
        status: "failed",
        stripe_status: pi.status,
        payment_method_type: (pi.payment_method_types?.[0] as string) ?? "card",
        failure_code: pi.last_payment_error?.code ?? null,
        failure_message: pi.last_payment_error?.message ?? null,
        updated_at: new Date().toISOString(),
        metadata: {
          last_payment_error: pi.last_payment_error,
        },
      },
      { onConflict: "stripe_payment_intent_id" }
    );

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
