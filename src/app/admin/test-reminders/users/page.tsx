import { createClient } from "@/lib/supabase/server";
import UsersTable from "@/components/admin/UsersTable";
import { Search, UserPlus, Download } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Get users who made bookings
  const { data: activeUsers } = await supabase
    .from("appointments")
    .select("user_id")
    .eq("status", "completed");

  const activeCount = new Set(activeUsers?.map((a) => a.user_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-gray-600">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <Download className="h-5 w-5" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            <UserPlus className="h-5 w-5" />
            Add User
          </button>
        </div>
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
          <p className="text-3xl font-bold text-blue-600">
            {users?.filter(
              (u) =>
                new Date(u.created_at) >=
                new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            ).length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="mb-1 text-sm text-gray-600">Inactive</p>
          <p className="text-3xl font-bold text-gray-600">
            {(count || 0) - activeCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <UsersTable users={users || []} />
    </div>
  );
}
