"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerificationActions({
  doctorId,
}: {
  doctorId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async (approve: boolean) => {
    const reason = approve ? null : prompt("Reason for rejection (optional):");

    if (!approve && reason === null) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify doctor");
      }

      toast.success(data.message);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleVerify(true)}
        disabled={loading}
        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Approve"}
      </button>
      <button
        onClick={() => handleVerify(false)}
        disabled={loading}
        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Reject"}
      </button>
    </div>
  );
}
