import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    const { appointmentId, rating, reviewText } = body;

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify appointment belongs to user and is completed
    const { data: appointment } = await supabase
      .from("appointments")
      .select("*, doctors(id)")
      .eq("id", appointmentId)
      .eq("user_id", user.id)
      .single();

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed appointments" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already submitted for this appointment" },
        { status: 409 }
      );
    }

    // Create review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        appointment_id: appointmentId,
        doctor_id: appointment.doctors.id,
        user_id: user.id,
        rating,
        review_text: reviewText || null,
        is_visible: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Review creation error:", error);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
