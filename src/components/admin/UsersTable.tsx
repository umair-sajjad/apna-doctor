"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Mail, Phone, X, Loader2, Search } from "lucide-react";
import { deleteUser } from "@/app/actions/admin";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter(
    (u) =>
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.full_name}"? This cannot be undone.`)) return;
    setDeletingId(user.id);
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.error) {
        alert(result.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
      setDeletingId(null);
    });
  }

  return (
    <>
      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or phone..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Active</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
                        {user.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id || isPending}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Delete user"
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                {selectedUser.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{selectedUser.full_name}</p>
                <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                </div>
              </div>
              {selectedUser.phone && (
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.phone}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedUser.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
