"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AvailabilityData {
  id: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: day,
          startTime: formData.get("startTime"),
          endTime: formData.get("endTime"),
          slotDuration: parseInt(formData.get("slotDuration") as string),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save availability");
      }

      toast.success("Availability saved successfully");
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

    setLoading(true);

    try {
      const response = await fetch(
        `/api/doctor/availability?id=${existing.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }

      toast.success("Availability removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
        >
          {existing ? "Edit" : "Set Hours"}
        </button>
        {existing && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Start Time</label>
          <input
            type="time"
            name="startTime"
            defaultValue={existing?.start_time || "09:00"}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Time</label>
          <input
            type="time"
            name="endTime"
            defaultValue={existing?.end_time || "17:00"}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slot Duration</label>
          <select
            name="slotDuration"
            defaultValue={existing?.slot_duration || 30}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
