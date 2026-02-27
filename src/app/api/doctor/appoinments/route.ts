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

    // Check if user is a doctor
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json(
        { error: "Only doctors can access this endpoint" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const date = url.searchParams.get("date");

    let query = supabase
      .from("appointments")
      .select("*, users(full_name, phone, email)")
      .eq("doctor_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    if (date) {
      query = query.eq("appointment_date", date);
    }

    const { data: appointments, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    // Get counts for different statuses
    const { count: todayCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("appointment_date", new Date().toISOString().split("T")[0])
      .in("status", ["pending", "confirmed"]);

    const { count: upcomingCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .in("status", ["pending", "confirmed"]);

    return NextResponse.json({
      appointments,
      stats: {
        todayCount: todayCount || 0,
        upcomingCount: upcomingCount || 0,
      },
    });
  } catch (error) {
    console.error("Doctor appointments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
