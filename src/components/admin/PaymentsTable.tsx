"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";

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

interface PaymentsTableProps {
  transactions: Transaction[];
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  switch (status) {
    case "succeeded":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
          <CheckCircle className="h-3 w-3" />
          Succeeded
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
          <XCircle className="h-3 w-3" />
          Refunded
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
  }
}

export default function PaymentsTable({ transactions }: PaymentsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No payment transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Stripe PI
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Booking Ref
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Doctor
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Method
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-4">
                  <span className="font-mono text-xs text-gray-500" title={tx.stripe_payment_intent_id}>
                    {tx.stripe_payment_intent_id.slice(0, 18)}…
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-sm font-medium text-blue-600">
                    {tx.appointments?.booking_reference ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {tx.appointments?.users?.full_name ??
                    tx.appointments?.patient_name ??
                    "—"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {tx.appointments?.doctors
                    ? `Dr. ${tx.appointments.doctors.full_name}`
                    : "—"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {tx.paid_at
                    ? new Date(tx.paid_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : new Date(tx.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-green-600">
                    PKR {tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs capitalize text-purple-700">
                    {tx.payment_method_type ?? "card"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={tx.status} />
                  {tx.status === "failed" && tx.failure_message && (
                    <p
                      className="mt-1 max-w-[160px] truncate text-xs text-red-500"
                      title={tx.failure_message}
                    >
                      {tx.failure_message}
                    </p>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
