"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Search, Download, Filter } from "lucide-react";

interface Transaction {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  payment_method_type: string | null;
  failure_message: string | null;
  paid_at: string | null;
  created_at: string;
  appointments: {
    booking_reference: string;
    appointment_date: string;
    appointment_time: string;
    patient_name: string;
    doctors: { full_name: string; specialization: string } | null;
    users: { full_name: string } | null;
  } | null;
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const map = {
    succeeded: { cls: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" />, label: "Succeeded" },
    failed:    { cls: "bg-red-100 text-red-700",     icon: <XCircle   className="h-3 w-3" />, label: "Failed"    },
    refunded:  { cls: "bg-orange-100 text-orange-700", icon: <XCircle className="h-3 w-3" />, label: "Refunded"  },
    pending:   { cls: "bg-yellow-100 text-yellow-700", icon: <Clock   className="h-3 w-3" />, label: "Pending"   },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function exportCSV(rows: Transaction[]) {
  const headers = [
    "Date", "Booking Ref", "Patient", "Doctor", "Amount (PKR)",
    "Method", "Status", "Stripe PI", "Failure",
  ];
  const lines = rows.map((tx) => [
    tx.paid_at
      ? new Date(tx.paid_at).toLocaleDateString("en-PK")
      : new Date(tx.created_at).toLocaleDateString("en-PK"),
    tx.appointments?.booking_reference ?? "",
    tx.appointments?.users?.full_name ?? tx.appointments?.patient_name ?? "",
    tx.appointments?.doctors ? `Dr. ${tx.appointments.doctors.full_name}` : "",
    String(tx.amount),
    tx.payment_method_type ?? "card",
    tx.status,
    tx.stripe_payment_intent_id,
    tx.failure_message ?? "",
  ].map((v) => `"${v.replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PaymentsTable({ transactions }: { transactions: Transaction[] }) {
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (!q) return true;
      const patient  = (tx.appointments?.users?.full_name ?? tx.appointments?.patient_name ?? "").toLowerCase();
      const doctor   = (tx.appointments?.doctors?.full_name ?? "").toLowerCase();
      const ref      = (tx.appointments?.booking_reference ?? "").toLowerCase();
      const pi       = tx.stripe_payment_intent_id.toLowerCase();
      return patient.includes(q) || doctor.includes(q) || ref.includes(q) || pi.includes(q);
    });
  }, [transactions, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, booking ref…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <p className="text-xs text-gray-400">
          {filtered.length} of {transactions.length} transactions
        </p>

        <button
          onClick={() => exportCSV(filtered)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-400">No transactions match your filters</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Date", "Booking Ref", "Patient", "Doctor", "Amount", "Method", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(tx.paid_at ?? tx.created_at).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {tx.appointments?.booking_reference ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {tx.appointments?.users?.full_name ?? tx.appointments?.patient_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {tx.appointments?.doctors ? `Dr. ${tx.appointments.doctors.full_name}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${tx.status === "succeeded" ? "text-green-600" : "text-gray-500"}`}>
                          PKR {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold capitalize text-purple-700">
                          {tx.payment_method_type ?? "card"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                        {tx.status === "failed" && tx.failure_message && (
                          <p className="mt-0.5 max-w-[160px] truncate text-xs text-red-500" title={tx.failure_message}>
                            {tx.failure_message}
                          </p>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
