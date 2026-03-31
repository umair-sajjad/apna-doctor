import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages/unread-count
// Returns the total unread message count for the current user or doctor.
// Used by navbars to show the badge.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  // Determine role
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();

  const isDoctor = !!doctor;
  const field = isDoctor ? "doctor_unread_count" : "user_unread_count";
  const participantField = isDoctor ? "doctor_id" : "user_id";

  const { data, error } = await supabase
    .from("dm_conversations")
    .select(field)
    .eq(participantField, user.id);

  if (error) return NextResponse.json({ count: 0 });

  const count = (data ?? []).reduce(
    (sum: number, row: Record<string, number>) => sum + (row[field] ?? 0),
    0
  );

  return NextResponse.json({ count });
}
