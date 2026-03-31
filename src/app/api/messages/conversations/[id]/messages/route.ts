import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/messages/conversations/[id]/messages?before=<ISO>
// Returns up to 50 messages in chronological order (cursor-based pagination).
export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before"); // ISO timestamp cursor

  // Verify participant access
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user_id, doctor_id")
    .eq("id", id)
    .or(`user_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const LIMIT = 50;
  let query = supabase
    .from("dm_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return in chronological order; hasMore = true means older messages exist
  const messages = (data ?? []).reverse();
  return NextResponse.json({
    messages,
    hasMore: (data?.length ?? 0) === LIMIT,
  });
}

// POST /api/messages/conversations/[id]/messages
// Send a new message (text or file)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify participant access and determine sender type
  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user_id, doctor_id")
    .eq("id", id)
    .or(`user_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const senderType: "user" | "doctor" = conv.user_id === user.id ? "user" : "doctor";

  const body = await request.json();
  const {
    content,
    messageType = "text",
    fileUrl,
    fileName,
    fileSize,
    fileType,
  } = body as {
    content?: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };

  // Input validation
  if (messageType === "text") {
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }
    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }
  } else {
    if (!fileUrl) {
      return NextResponse.json(
        { error: "fileUrl is required for file messages" },
        { status: 400 }
      );
    }
    if (!["image", "document"].includes(messageType)) {
      return NextResponse.json(
        { error: "Invalid messageType" },
        { status: 400 }
      );
    }
  }

  const { data: message, error } = await supabase
    .from("dm_messages")
    .insert({
      conversation_id: id,
      sender_id: user.id,
      sender_type: senderType,
      content: content?.trim() || null,
      message_type: messageType,
      file_url: fileUrl || null,
      file_name: fileName || null,
      file_size: fileSize || null,
      file_type: fileType || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message }, { status: 201 });
}
