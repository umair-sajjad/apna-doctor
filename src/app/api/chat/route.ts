import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chat/stage-manager";
import { ChatApiRequest } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatApiRequest = await request.json();
    const { message, conversationId, action, payload } = body;

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: "message and conversationId are required" },
        { status: 400 }
      );
    }

    const response = await processMessage(
      conversationId,
      user.id,
      message,
      action,
      payload
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
