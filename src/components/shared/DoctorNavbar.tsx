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

  return (
    <DoctorNavbarClient
      doctor={{
        id: doctor.id,
        full_name: doctor.full_name,
        email: user.email ?? "",
        profile_photo: doctor.profile_image ?? null,
      }}
    />
  );
}
