import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/user");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />
      <AppointmentsClient />
    </div>
  );
}
