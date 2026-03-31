import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/notifications/[id]/read — mark single notification as read
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/notifications/[id]/read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
