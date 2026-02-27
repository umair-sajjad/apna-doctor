"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentActions({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/doctor/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update appointment");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold">Actions</h3>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        {currentStatus === "pending" && (
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm Appointment"}
          </button>
        )}

        {(currentStatus === "confirmed" || currentStatus === "pending") && (
          <>
            <button
              onClick={() => updateStatus("completed")}
              disabled={loading}
              className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Marking..." : "Mark as Completed"}
            </button>

            <button
              onClick={() => updateStatus("no_show")}
              disabled={loading}
              className="rounded-md bg-yellow-600 px-6 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? "Marking..." : "Mark as No Show"}
            </button>

            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading}
              className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel Appointment"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
