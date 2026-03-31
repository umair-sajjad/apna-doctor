import { createClient } from "@/lib/supabase/server";
import UserNavbarClient from "./UserNavbarClient";

export default async function UserNavbar({}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <UserNavbarClient user={null} />;
  }

  // Don't show user navbar for doctors
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();

  if (doctor) {
    return <UserNavbarClient user={null} />;
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, full_name, email, profile_photo")
    .eq("id", user.id)
    .single();

  if (!userData) {
    return <UserNavbarClient user={null} />;
  }

  // Unread message count
  const { data: unreadConvs } = await supabase
    .from("dm_conversations")
    .select("user_unread_count")
    .eq("user_id", user.id)
    .gt("user_unread_count", 0);

  const messageCount = (unreadConvs ?? []).reduce(
    (sum, row) => sum + (row.user_unread_count ?? 0),
    0
  );

  // Unread notification count
  const { count: notificationCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <UserNavbarClient
      user={userData}
      messageCount={messageCount}
      notificationCount={notificationCount ?? 0}
    />
  );
}
