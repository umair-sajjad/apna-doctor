import { createClient } from "@/lib/supabase/server";
import UserNavbar from "@/components/shared/UserNavbar";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <UserNavbar />
      <HomeClient isLoggedIn={!!user} />
    </>
  );
}
