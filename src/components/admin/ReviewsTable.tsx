"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { toggleReviewVisibility, deleteReview } from "@/app/actions/admin";

interface Review {
  id: string;
  rating: number;
  review_text?: string;
  is_visible: boolean;
  created_at: string;
  users?: { full_name: string } | null;
  doctors?: { full_name: string } | null;
}

interface ReviewsTableProps {
  reviews: Review[];
}

export default function ReviewsTable({ reviews: initial }: ReviewsTableProps) {
  const [reviews, setReviews] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    if (!confirm("Delete this review? This cannot be undone.")) return;
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

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
        No reviews found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doctor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Review</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review, index) => (
              <motion.tr
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-4 text-sm text-gray-900">
                  {review.users?.full_name || "Anonymous"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {review.doctors ? `Dr. ${review.doctors.full_name}` : "—"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="text-sm text-gray-600">({review.rating})</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="line-clamp-2 max-w-md text-sm text-gray-700">
                    {review.review_text || "No comment"}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  {review.is_visible ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Visible</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggle(review)}
                      disabled={loadingId === review.id || isPending}
                      className="rounded p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                      title={review.is_visible ? "Hide review" : "Show review"}
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
                      disabled={loadingId === review.id + "-del" || isPending}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Delete review"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
