import { createClient } from "@supabase/supabase-js";
import { Suspense } from "react";
import ReviewsTable from "@/components/admin/ReviewsTable";
import { Star, Eye, EyeOff, MessageSquare, TrendingUp, Loader2 } from "lucide-react";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; visibility?: string; search?: string }>;
}) {
  const params = await searchParams;
  const ratingFilter = params.rating ? Number(params.rating) : null;
  const visibilityFilter = params.visibility ?? "all"; // "all" | "visible" | "hidden"
  const search = params.search?.trim().toLowerCase() ?? "";

  // Fetch all reviews with relations
  let query = adminSupabase
    .from("reviews")
    .select(
      `*, doctors(id, full_name), users(full_name), appointments(appointment_date)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (ratingFilter) query = query.eq("rating", ratingFilter);
  if (visibilityFilter === "visible") query = query.eq("is_visible", true);
  if (visibilityFilter === "hidden") query = query.eq("is_visible", false);

  const { data: allReviews, count } = await query;

  // Client-side search filter (name search on fetched data)
  const reviews = (allReviews ?? []).filter((r) => {
    if (!search) return true;
    const patient = r.users?.full_name?.toLowerCase() ?? "";
    const doctor = r.doctors?.full_name?.toLowerCase() ?? "";
    return patient.includes(search) || doctor.includes(search);
  });

  // Stats (always computed from the full unfiltered dataset)
  const { data: allForStats } = await adminSupabase
    .from("reviews")
    .select("rating, is_visible");

  const totalCount = allForStats?.length ?? 0;
  const avgRating =
    totalCount > 0
      ? (allForStats!.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(1)
      : "0.0";
  const visibleCount = allForStats?.filter((r) => r.is_visible).length ?? 0;
  const hiddenCount = allForStats?.filter((r) => !r.is_visible).length ?? 0;

  const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allForStats?.filter((r) => r.rating === star).length ?? 0,
    pct:
      totalCount > 0
        ? Math.round(
            ((allForStats?.filter((r) => r.rating === star).length ?? 0) /
              totalCount) *
              100
          )
        : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and moderate patient reviews
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={String(totalCount)}
          icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Avg Rating"
          value={`${avgRating} ★`}
          icon={<TrendingUp className="h-5 w-5 text-yellow-500" />}
          bg="bg-yellow-50"
          valueClass="text-yellow-600"
        />
        <StatCard
          label="Visible"
          value={String(visibleCount)}
          icon={<Eye className="h-5 w-5 text-green-500" />}
          bg="bg-green-50"
          valueClass="text-green-700"
        />
        <StatCard
          label="Hidden"
          value={String(hiddenCount)}
          icon={<EyeOff className="h-5 w-5 text-red-400" />}
          bg="bg-red-50"
          valueClass="text-red-600"
        />
      </div>

      {/* Rating distribution bar */}
      {totalCount > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-gray-700">Rating Breakdown</p>
          <div className="space-y-2">
            {starBreakdown.map(({ star, count: cnt, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex w-14 shrink-0 items-center justify-end gap-1 text-xs text-gray-500">
                  {star} <Star size={10} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-gray-400">
                  {cnt} ({pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }>
        <ReviewsTable
          reviews={reviews}
          totalCount={count ?? 0}
          currentRating={ratingFilter}
          currentVisibility={visibilityFilter}
          currentSearch={search}
        />
      </Suspense>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`rounded-lg p-2 ${bg}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
