"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { updateAppointmentStatus } from "@/app/actions/admin";

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
}

export default function AppointmentActions({
  appointmentId,
  currentStatus,
}: AppointmentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(newStatus: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const buttons = [
    {
      label: "Mark Confirmed",
      status: "confirmed",
      icon: CheckCircle,
      className: "bg-blue-600 text-white hover:bg-blue-700",
      show: currentStatus !== "confirmed" && currentStatus !== "completed",
    },
    {
      label: "Mark Completed",
      status: "completed",
      icon: CheckCircle,
      className: "bg-green-600 text-white hover:bg-green-700",
      show: currentStatus === "confirmed",
    },
    {
      label: "Mark Cancelled",
      status: "cancelled",
      icon: XCircle,
      className: "bg-red-600 text-white hover:bg-red-700",
      show: currentStatus !== "cancelled" && currentStatus !== "completed",
    },
    {
      label: "Reset to Pending",
      status: "pending",
      icon: Clock,
      className: "border border-gray-300 text-gray-700 hover:bg-gray-50",
      show: currentStatus === "cancelled",
    },
  ];

  const visibleButtons = buttons.filter((b) => b.show);
  if (visibleButtons.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>
      <div className="space-y-2">
        {visibleButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.status}
              onClick={() => handleStatus(btn.status)}
              disabled={isPending}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${btn.className}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {btn.label}
            </button>
          );
        })}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
