import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test query - count users table
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      usersCount: count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}