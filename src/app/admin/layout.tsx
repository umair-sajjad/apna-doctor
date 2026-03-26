import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!admin) {
    redirect("/login/admin");
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} admin={admin} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
