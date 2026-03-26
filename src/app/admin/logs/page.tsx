import { createClient } from "@/lib/supabase/server";
import { FileCode, AlertCircle, CheckCircle, Info, Search } from "lucide-react";

export default async function AdminLogsPage() {
  const supabase = await createClient();

  // Get notification logs
  const { data: logs } = await supabase
    .from("notification_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const successCount = logs?.filter((l) => l.status === "sent").length || 0;
  const errorCount = logs?.filter((l) => l.status === "failed").length || 0;
  const pendingCount = logs?.filter((l) => l.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="mt-1 text-gray-600">
            Monitor system activities and errors
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
          <FileCode className="h-5 w-5" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Logs</p>
            <FileCode className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {logs?.length || 0}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Success</p>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{successCount}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Errors</p>
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{errorCount}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Pending</p>
            <Info className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select className="rounded-lg border border-gray-300 px-4 py-2">
            <option>All Types</option>
            <option>Email</option>
            <option>SMS</option>
            <option>System</option>
          </select>
          <select className="rounded-lg border border-gray-300 px-4 py-2">
            <option>All Status</option>
            <option>Success</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {log.recipient}
                  </td>
                  <td className="max-w-md truncate px-4 py-4 text-sm text-gray-700">
                    {log.subject || log.message}
                  </td>
                  <td className="px-4 py-4">
                    {log.status === "sent" ? (
                      <span className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Sent
                      </span>
                    ) : log.status === "failed" ? (
                      <span className="flex items-center gap-1 text-xs text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        Failed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-700">
                        <Info className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {log.error_message || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
