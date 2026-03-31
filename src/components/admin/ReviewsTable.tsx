"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Trash2, Loader2, Star, Search, Filter } from "lucide-react";
import { toggleReviewVisibility, deleteReview } from "@/app/actions/admin";

interface Review {
  id: string;
  rating: number;
  review_text?: string | null;
  is_visible: boolean;
  created_at: string;
  users?: { full_name: string } | null;
  doctors?: { full_name: string } | null;
  appointments?: { appointment_date: string } | null;
}

interface Props {
  reviews: Review[];
  totalCount: number;
  currentRating: number | null;
  currentVisibility: string;
  currentSearch: string;
}

export default function ReviewsTable({
  reviews: initial,
  totalCount,
  currentRating,
  currentVisibility,
  currentSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
  };

  function handleToggle(review: Review) {
    setLoadingId(review.id);
    startTransition(async () => {
      const result = await toggleReviewVisibility(review.id, review.is_visible);
      if (result.error) {
        alert(result.error);
      } else {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id ? { ...r, is_visible: !r.is_visible } : r
          )
        );
      }
      setLoadingId(null);
    });
  }

  function handleDelete(review: Review) {
    if (!confirm(`Delete this ${review.rating}★ review by ${review.users?.full_name ?? "Anonymous"}? This cannot be undone.`))
      return;
    setLoadingId(review.id + "-del");
    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (result.error) {
        alert(result.error);
      } else {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
      }
      setLoadingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex min-w-[200px] flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or doctor…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Search
          </button>
          {currentSearch && (
            <button
              type="button"
              onClick={() => { setSearch(""); updateFilter("search", null); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />

          {/* Rating filter */}
          <select
            value={currentRating ?? ""}
            onChange={(e) => updateFilter("rating", e.target.value || null)}
            className="rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>{s} ★</option>
            ))}
          </select>

          {/* Visibility filter */}
          <select
            value={currentVisibility}
            onChange={(e) => updateFilter("visibility", e.target.value)}
            className="rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <p className="ml-auto text-xs text-gray-400">
          {reviews.length} of {totalCount} reviews
        </p>
      </div>

      {/* Table */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Star className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="text-sm text-gray-400">No reviews match your filters</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Review
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {reviews.map((review, index) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`hover:bg-gray-50 ${!review.is_visible ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {review.users?.full_name || "Anonymous"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {review.doctors ? `Dr. ${review.doctors.full_name}` : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star
                                key={s}
                                size={12}
                                className={
                                  s < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="line-clamp-2 max-w-sm text-sm text-gray-600">
                          {review.review_text || (
                            <span className="italic text-gray-400">No comment</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        {review.is_visible ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <Eye size={10} /> Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            <EyeOff size={10} /> Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggle(review)}
                            disabled={loadingId === review.id || isPending}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            title={review.is_visible ? "Hide review" : "Make visible"}
                          >
                            {loadingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : review.is_visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(review)}
                            disabled={
                              loadingId === review.id + "-del" || isPending
                            }
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            title="Delete review permanently"
                          >
                            {loadingId === review.id + "-del" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
