import { createClient } from "@supabase/supabase-js";
import ReviewsTable from "@/components/admin/ReviewsTable";
import { Star, ThumbsUp, Eye, EyeOff } from "lucide-react";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminReviewsPage() {
  const supabase = adminSupabase;

  const { data: reviews, count } = await supabase
    .from("reviews")
    .select(
      `
      *,
      doctors(full_name),
      users(full_name),
      appointments(appointment_date)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  const avgRating =
    reviews?.reduce((sum, r) => sum + r.rating, 0) / (reviews?.length || 1) ||
    0;
  const visibleCount = reviews?.filter((r) => r.is_visible).length || 0;
  const hiddenCount = reviews?.filter((r) => !r.is_visible).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews & Ratings
          </h1>
          <p className="mt-1 text-gray-600">
            Monitor and moderate user reviews
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Reviews</p>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{count || 0}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Average Rating</p>
            <ThumbsUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {avgRating.toFixed(1)} ⭐
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Visible</p>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{visibleCount}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Hidden</p>
            <EyeOff className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-red-600">{hiddenCount}</p>
        </div>
      </div>

      <ReviewsTable reviews={reviews || []} />
    </div>
  );
}
