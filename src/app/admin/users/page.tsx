import { createClient } from "@supabase/supabase-js";
import UsersTable from "@/components/admin/UsersTable";
import { Download } from "lucide-react";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminUsersPage() {
  const { data: users, count } = await adminSupabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const { data: activeUsers } = await adminSupabase
    .from("appointments")
    .select("user_id")
    .eq("status", "completed");

  const activeCount = new Set(activeUsers?.map((a) => a.user_id)).size;

  const newThisMonth =
    users?.filter(
      (u) =>
        new Date(u.created_at) >=
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-gray-600">Manage all registered patients</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{count || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">New This Month</p>
          <p className="text-3xl font-bold text-blue-600">{newThisMonth}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Inactive</p>
          <p className="text-3xl font-bold text-gray-600">
            {(count || 0) - activeCount}
          </p>
        </div>
      </div>

      <UsersTable users={users || []} />
    </div>
  );
}
