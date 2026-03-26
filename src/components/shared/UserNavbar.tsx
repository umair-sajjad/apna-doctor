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

  return <UserNavbarClient user={userData} />;
}
