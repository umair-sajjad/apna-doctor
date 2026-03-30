import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chat/conversations/[id]/messages — load all messages for a conversation
export async function GET(
  _req: NextRequest,
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

    // Verify the conversation belongs to this user
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages ?? [] });
  } catch (err) {
    console.error("GET /api/chat/conversations/[id]/messages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
