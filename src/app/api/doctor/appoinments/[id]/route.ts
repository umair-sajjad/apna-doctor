import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { notifyAppointmentStatusChanged } from "@/lib/notifications/in-app";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Verify this appointment belongs to this doctor
    const { data: appointment } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .eq("doctor_id", user.id)
      .single();

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update appointment status
    const { data: updatedAppointment, error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 }
      );
    }

    // Fire in-app notification to patient (non-blocking)
    notifyAppointmentStatusChanged(id, status).catch((e) =>
      console.error("[doctor PATCH] In-app notification error:", e)
    );

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
