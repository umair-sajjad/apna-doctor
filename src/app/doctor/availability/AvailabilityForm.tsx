"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2, X, Check } from "lucide-react";

interface AvailabilityData {
  id: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

const INPUT_CLASS =
  "w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none";
const INPUT_STYLE = {
  borderColor: "var(--primary-light)",
  color: "var(--text-dark)",
};
const LABEL_CLASS = "mb-1 block text-xs font-semibold uppercase tracking-wide";
const LABEL_STYLE = { color: "var(--text-dark)" };

export default function AvailabilityForm({
  day,
  existing,
}: {
  day: number;
  existing?: AvailabilityData;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: day,
          startTime: formData.get("startTime"),
          endTime: formData.get("endTime"),
          slotDuration: parseInt(formData.get("slotDuration") as string),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save availability");
      toast.success("Availability saved");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/doctor/availability?id=${existing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete availability");
      toast.success("Availability removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Collapsed view ─────────────────────────────── */
  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-blue-50"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--primary)",
          }}
        >
          <Pencil size={12} />
          {existing ? "Edit" : "Set Hours"}
        </button>
        {existing && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: "#fca5a5", color: "#dc2626" }}
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            {deleting ? "Removing…" : "Remove"}
          </button>
        )}
      </div>
    );
  }

  /* ── Edit form ───────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl p-4"
      style={{
        background: "var(--bg-soft)",
        border: "1px solid var(--primary-light)",
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL_CLASS} style={LABEL_STYLE}>
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            defaultValue={existing?.start_time || "09:00"}
            required
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} style={LABEL_STYLE}>
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            defaultValue={existing?.end_time || "17:00"}
            required
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} style={LABEL_STYLE}>
            Slot Duration
          </label>
          <select
            name="slotDuration"
            defaultValue={existing?.slot_duration || 30}
            required
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          {loading ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-gray-100"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </form>
  );
}
