import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import ChatInterface from "./ChatInterface";
import LocationTracker from "@/components/location/LocationTracker";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("location_permission_granted")
    .eq("id", user.id)
    .single();

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      <UserNavbar />
      <LocationTracker
        userId={user.id}
        locationPermissionGranted={profile?.location_permission_granted ?? null}
      />
      <ChatInterface />
    </div>
  );
}
