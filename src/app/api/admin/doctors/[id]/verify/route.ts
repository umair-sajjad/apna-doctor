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

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { approve, reason } = await request.json();

    const { data: doctor, error } = await supabase
      .from("doctors")
      .update({
        is_verified: approve,
        verified_at: approve ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Verify doctor error:", error);
      return NextResponse.json(
        { error: "Failed to update doctor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      doctor,
      message: approve
        ? "Doctor approved successfully"
        : `Doctor rejected${reason ? `: ${reason}` : ""}`,
    });
  } catch (error) {
    console.error("Verify doctor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
