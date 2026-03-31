import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages/conversations
// Returns all conversations for the current user or doctor, ordered by recency
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Determine role
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  const isDoctor = !!doctor;

  if (isDoctor) {
    const { data, error } = await supabase
      .from("dm_conversations")
      .select(
        `id, last_message_at, last_message_preview, doctor_unread_count,
         users:user_id ( id, full_name, profile_photo )`
      )
      .eq("doctor_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ conversations: data ?? [], isDoctor: true });
  } else {
    const { data, error } = await supabase
      .from("dm_conversations")
      .select(
        `id, last_message_at, last_message_preview, user_unread_count,
         doctors:doctor_id ( id, full_name, profile_image, specialization )`
      )
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ conversations: data ?? [], isDoctor: false });
  }
}

// POST /api/messages/conversations
// Find or create a conversation between two participants.
// If caller is a user  → body: { doctorId }
// If caller is a doctor → body: { userId }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { doctorId, userId } = body as { doctorId?: string; userId?: string };

  // Determine role and resolve the two participant IDs
  const { data: doctorSelf } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  const isDoctor = !!doctorSelf;

  let resolvedUserId: string;
  let resolvedDoctorId: string;

  if (isDoctor) {
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    resolvedDoctorId = user.id;
    resolvedUserId = userId;
    // Verify the patient exists
    const { data: patient } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  } else {
    if (!doctorId) return NextResponse.json({ error: "doctorId required" }, { status: 400 });
    resolvedUserId = user.id;
    resolvedDoctorId = doctorId;
    // Verify caller is a registered patient
    const { data: patient } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();
    if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // Verify doctor exists and is active
    const { data: doc } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", doctorId)
      .single();
    if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // Return existing conversation if present
  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("id")
    .eq("user_id", resolvedUserId)
    .eq("doctor_id", resolvedDoctorId)
    .single();

  if (existing) return NextResponse.json({ conversationId: existing.id });

  // Create new conversation
  const { data: created, error } = await supabase
    .from("dm_conversations")
    .insert({ user_id: resolvedUserId, doctor_id: resolvedDoctorId })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversationId: created.id }, { status: 201 });
}
