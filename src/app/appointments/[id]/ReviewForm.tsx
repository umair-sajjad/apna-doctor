"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

export default function ReviewForm({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          rating,
          reviewText: formData.get("reviewText"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      toast.success("Review submitted successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stars */}
      <div>
        <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-100 text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Text */}
      <div>
        <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Review (Optional)
        </label>
        <textarea
          name="reviewText"
          rows={4}
          placeholder="Share your experience with this doctor…"
          className="w-full resize-none rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
            background: "var(--bg-soft)",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
