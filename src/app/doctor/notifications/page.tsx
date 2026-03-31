import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import NotificationsList from "@/components/notifications/NotificationsList";

export async function generateMetadata() {
  return { title: "Notifications - ApnaDoctor Doctor Portal" };
}

export default async function DoctorNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/doctor");

  // Confirm caller is a doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/login/doctor");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />
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
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>Doctor Portal</p>
              <h1 className="font-display mt-1 text-2xl font-bold text-white">Notifications</h1>
              <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                New bookings, cancellations, and appointment updates
              </p>
            </div>
            {(unreadCount ?? 0) > 0 && (
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        <NotificationsList
          initialNotifications={notifications ?? []}
          userId={user.id}
        />
      </div>
    </div>
  );
}
