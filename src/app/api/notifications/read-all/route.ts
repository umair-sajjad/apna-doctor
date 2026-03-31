import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PUT /api/notifications/read-all — mark all notifications as read
export async function PUT() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/notifications/read-all error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
