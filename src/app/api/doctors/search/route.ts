import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 9;

// GET /api/doctors/search
// Supports: q, specialization, city, gender, minRating, maxFee, language, sortBy, page
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const sp = new URL(req.url).searchParams;

    const q = sp.get("q")?.trim() ?? "";
    const spec = sp.get("specialization") || null;
    const city = sp.get("city") || null;
    const gender = sp.get("gender") || null;
    const minRating = sp.get("minRating") ? parseFloat(sp.get("minRating")!) : null;
    const maxFee = sp.get("maxFee") ? parseInt(sp.get("maxFee")!, 10) : null;
    const language = sp.get("language") || null;
    const sortBy = sp.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase.rpc("search_doctors", {
      p_query: q,
      p_spec: spec,
      p_city: city,
      p_gender: gender,
      p_min_rating: minRating,
      p_max_fee: maxFee,
      p_language: language,
      p_sort_by: sortBy,
      p_offset: offset,
      p_limit: PAGE_SIZE,
    });

    if (error) {
      console.error("search_doctors RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalCount = Number((data as any[])?.[0]?.total_count ?? 0);

    // Strip the window-function column from each row before sending to client
    const doctors = (data ?? []).map(({ total_count: _tc, ...doc }: any) => ({
      ...doc,
      clinic_location: null, // location enrichment is done server-side for map view
    }));

    return NextResponse.json({
      doctors,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
    });
  } catch (err) {
    console.error("GET /api/doctors/search error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
