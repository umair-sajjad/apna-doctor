"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  CalendarX,
  CalendarDays,
  CheckCheck,
  Clock,
  CreditCard,
} from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

interface Props {
  initialNotifications: Notification[];
  userId: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  appointment_confirmed: <CalendarCheck size={18} style={{ color: "var(--primary)" }} />,
  appointment_booked: <CalendarCheck size={18} style={{ color: "var(--primary)" }} />,
  appointment_cancelled: <CalendarX size={18} className="text-red-500" />,
  appointment_status_changed: <CalendarDays size={18} style={{ color: "var(--accent)" }} />,
  payment_received: <CreditCard size={18} className="text-emerald-500" />,
  appointment_reminder: <Clock size={18} style={{ color: "var(--accent)" }} />,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

export default function NotificationsList({ initialNotifications, userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
  }, []);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await fetch("/api/notifications/read-all", { method: "PUT" });
    setMarkingAll(false);
  }, [unreadCount]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (notifications.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--primary-light)" }}
        >
          <Bell size={26} style={{ color: "var(--primary)" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-dark)" }}>
          No notifications yet
        </p>
        <p className="mt-1 max-w-xs text-xs text-gray-400">
          You&apos;ll see appointment reminders, confirmations, and updates here.
        </p>
        <Link
          href="/appointments"
          className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
        >
          <CalendarDays size={13} /> View Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{unreadCount} unread</span>
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-50"
            style={{ color: "var(--primary)", background: "var(--primary-light)" }}
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid var(--primary-light)" }}>
        {notifications.map((n, idx) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={markAsRead}
            isLast={idx === notifications.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({
  notification: n,
  onRead,
  isLast,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  isLast: boolean;
}) {
  const appointmentId = (n.data?.appointmentId as string) ?? null;

  const handleClick = () => {
    if (!n.is_read) onRead(n.id);
  };

  const inner = (
    <div
      className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${
        !isLast ? "border-b" : ""
      }`}
      style={{
        borderColor: "var(--primary-light)",
        background: n.is_read ? undefined : "rgba(14,165,233,0.04)",
      }}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-soft)" }}
      >
        {TYPE_ICON[n.type] ?? <Bell size={18} className="text-gray-400" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-dark)" }}
          >
            {n.title}
          </p>
          <span className="shrink-0 text-xs text-gray-400">{timeAgo(n.created_at)}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{n.message}</p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );

  if (appointmentId) {
    return (
      <Link href="/appointments" onClick={handleClick}>
        {inner}
      </Link>
    );
  }

  return inner;
}
