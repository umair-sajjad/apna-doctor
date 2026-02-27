import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

    // Check if user is admin
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { approve, reason } = body;

    if (approve) {
      // Approve doctor
      const { data: doctor, error } = await supabase
        .from("doctors")
        .update({
          is_verified: true,
          verification_status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to verify doctor" },
          { status: 500 }
        );
      }

      return NextResponse.json({ doctor, message: "Doctor approved" });
    } else {
      // Reject doctor
      const { data: doctor, error } = await supabase
        .from("doctors")
        .update({
          verification_status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to reject doctor" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        doctor,
        message: `Doctor rejected: ${reason}`,
      });
    }
  } catch (error) {
    console.error("Verify doctor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
