import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import Link from "next/link";
import { Bell, CalendarDays } from "lucide-react";

export async function generateMetadata() {
  return { title: "Notifications - ApnaDoctor" };
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/user");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />
      <div className="mx-auto max-w-3xl px-4 py-10">

        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-7"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10"
            style={{ background: "radial-gradient(ellipse at right, var(--accent), transparent 70%)" }}
          />
          <div className="relative z-10">
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>Updates</p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Stay updated with your appointments and alerts
            </p>
          </div>
        </div>

        {/* Empty state */}
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
            You'll see appointment reminders, confirmations, and updates here.
          </p>
          <Link
            href="/appointments"
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
          >
            <CalendarDays size={13} /> View Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}