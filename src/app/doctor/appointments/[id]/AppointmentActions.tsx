"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  Loader2,
} from "lucide-react";

interface Action {
  status: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  gradient?: string;
}

const ACTIONS: Record<string, Action[]> = {
  pending: [
    {
      status: "confirmed",
      label: "Confirm Appointment",
      icon: ThumbsUp,
      color: "white",
      bg: "",
      gradient: "linear-gradient(135deg, var(--primary), var(--accent))",
    },
    {
      status: "completed",
      label: "Mark as Completed",
      icon: CheckCircle2,
      color: "white",
      bg: "#059669",
    },
    {
      status: "no_show",
      label: "Mark as No Show",
      icon: AlertCircle,
      color: "white",
      bg: "#d97706",
    },
    {
      status: "cancelled",
      label: "Cancel",
      icon: XCircle,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ],
  confirmed: [
    {
      status: "completed",
      label: "Mark as Completed",
      icon: CheckCircle2,
      color: "white",
      bg: "#059669",
    },
    {
      status: "no_show",
      label: "Mark as No Show",
      icon: AlertCircle,
      color: "white",
      bg: "#d97706",
    },
    {
      status: "cancelled",
      label: "Cancel",
      icon: XCircle,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ],
};

export default function AppointmentActions({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to update appointment");
      toast.success(`Appointment marked as ${newStatus.replace("_", " ")}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const actions = ACTIONS[currentStatus] ?? [];
  if (actions.length === 0) return null;

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <p
        className="mb-4 text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--accent)" }}
      >
        Actions
      </p>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const isLoading = loading === action.status;
          return (
            <button
              key={action.status}
              onClick={() => updateStatus(action.status)}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={
                action.gradient
                  ? { background: action.gradient, color: action.color }
                  : { background: action.bg, color: action.color }
              }
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <action.icon size={14} />
              )}
              {isLoading ? "Updating…" : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
