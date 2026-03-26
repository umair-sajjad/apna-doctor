import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import ChatInterface from "./ChatInterface";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-soft)" }}
    >
      <UserNavbar />
      <ChatInterface />
    </div>
  );
}
