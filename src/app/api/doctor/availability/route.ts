import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get doctor's availability
    const { data: availability, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", user.id)
      .order("day_of_week", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { dayOfWeek, startTime, endTime, slotDuration } = body;

    // Validate
    if (dayOfWeek === undefined || !startTime || !endTime || !slotDuration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from("doctor_availability")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .single();

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("doctor_availability")
        .update({
          start_time: startTime,
          end_time: endTime,
          slot_duration: slotDuration,
          is_active: true,
        })
        .eq("id", existing.id)
        .select()
        .single();

      result = data;
      if (error) throw error;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("doctor_availability")
        .insert({
          doctor_id: user.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          slot_duration: slotDuration,
          is_active: true,
        })
        .select()
        .single();

      result = data;
      if (error) throw error;
    }

    return NextResponse.json({ availability: result }, { status: 201 });
  } catch (error) {
    console.error("Create availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("doctor_availability")
      .delete()
      .eq("id", id)
      .eq("doctor_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
