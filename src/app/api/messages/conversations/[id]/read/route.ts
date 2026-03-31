import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/messages/conversations/[id]/read
// Resets the unread counter for the current participant
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify access
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user_id, doctor_id")
    .eq("id", id)
    .or(`user_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .single();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reset the correct unread counter
  const field =
    conv.user_id === user.id ? "user_unread_count" : "doctor_unread_count";

  const { error } = await supabase
    .from("dm_conversations")
    .update({ [field]: 0 })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
