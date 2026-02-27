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

    // Check if user is admin
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get pending doctors
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_verified", false)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch doctors" },
        { status: 500 }
      );
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Get pending doctors error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}