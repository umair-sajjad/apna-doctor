import { createClient } from "@/lib/supabase/server";
import DoctorNavbarClient from "./DoctorNavbarClient";

export default async function DoctorNavbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DoctorNavbarClient doctor={null} />;
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, full_name, profile_image")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    return <DoctorNavbarClient doctor={null} />;
  }

  // Unread message count for doctor
  const { data: unreadConvs } = await supabase
    .from("dm_conversations")
    .select("doctor_unread_count")
    .eq("doctor_id", user.id)
    .gt("doctor_unread_count", 0);

  const messageCount = (unreadConvs ?? []).reduce(
    (sum, row) => sum + (row.doctor_unread_count ?? 0),
    0
  );

  // Unread notification count
  const { count: notificationCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <DoctorNavbarClient
      doctor={{
        id: doctor.id,
        full_name: doctor.full_name,
        email: user.email ?? "",
        profile_photo: doctor.profile_image ?? null,
      }}
      messageCount={messageCount}
      notificationCount={notificationCount ?? 0}
    />
  );
}
