import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called by cron or manually — cancels unpaid pending appointments older than 30 min
export async function POST() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data, error } = await adminSupabase
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("status", "pending")
    .eq("payment_status", "pending")
    .lt("created_at", cutoff)
    .select("id, booking_reference");

  if (error) {
    console.error("[expire-appointments] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[expire-appointments] Cancelled ${data?.length ?? 0} stale appointments`);
  return NextResponse.json({ cancelled: data?.length ?? 0, appointments: data });
}
