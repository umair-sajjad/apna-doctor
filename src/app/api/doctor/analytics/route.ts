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
      .select("id, consultation_fee")
      .eq("id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date range
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "month";

    let startDate = new Date();
    if (range === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (range === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const startDateStr = startDate.toISOString().split("T")[0];

    // Total appointments
    const { count: totalAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id);

    // Completed appointments
    const { count: completedAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("status", "completed");

    // Appointments in range
    const { data: rangeAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", user.id)
      .gte("appointment_date", startDateStr);

    // Calculate revenue
    const totalRevenue = rangeAppointments?.reduce(
      (sum, apt) =>
        apt.status === "completed" ? sum + (apt.consultation_fee || 0) : sum,
      0
    );

    // No-show rate
    const { count: noShows } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("status", "no_show")
      .gte("appointment_date", startDateStr);

    // Reviews stats
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, created_at")
      .eq("doctor_id", user.id)
      .gte("created_at", startDate.toISOString());

    // Appointments by day
    const appointmentsByDay = rangeAppointments?.reduce((acc: any, apt) => {
      const date = apt.appointment_date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Appointments by status
    const appointmentsByStatus = rangeAppointments?.reduce((acc: any, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      analytics: {
        totalAppointments: totalAppointments || 0,
        completedAppointments: completedAppointments || 0,
        rangeAppointments: rangeAppointments?.length || 0,
        totalRevenue: totalRevenue || 0,
        noShows: noShows || 0,
        noShowRate:
          (rangeAppointments?.length ?? 0) > 0
            ? ((noShows || 0) / (rangeAppointments?.length ?? 0)) * 100
            : 0,
        averageRating:
          reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0,
        totalReviews: reviews?.length || 0,
        appointmentsByDay: appointmentsByDay || {},
        appointmentsByStatus: appointmentsByStatus || {},
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}