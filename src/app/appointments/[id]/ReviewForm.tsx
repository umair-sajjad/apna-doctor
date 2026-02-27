"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ReviewForm({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          rating,
          reviewText: formData.get("reviewText"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-black">Rating</label>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-colors"
            >
              {star <= (hoveredRating || rating) ? (
                <span className="text-yellow-500">⭐</span>
              ) : (
                <span className="text-gray-300">☆</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-black">
          Review (Optional)
        </label>
        <textarea
          name="reviewText"
          rows={4}
          placeholder="Share your experience with this doctor..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
