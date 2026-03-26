"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, Clock, Calendar, Search, Filter } from "lucide-react";
import Link from "next/link";

interface AppointmentsTableProps {
  appointments: any[];
}

const STATUS_OPTIONS = ["All", "pending", "confirmed", "completed", "cancelled"];

export default function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = appointments.filter((a) => {
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.booking_reference?.toLowerCase().includes(q) ||
      a.patient_name?.toLowerCase().includes(q) ||
      a.patient_email?.toLowerCase().includes(q) ||
      a.doctors?.full_name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    const icons: Record<string, React.ElementType> = {
      confirmed: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle,
      pending: Clock,
    };
    const Icon = icons[status] || Clock;
    const style = styles[status] || styles.pending;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${style}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, doctor, or booking reference..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(search || statusFilter !== "All") && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filtered.length} of {appointments.length} appointments
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Booking Ref</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
              {filtered.map((appointment, index) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm font-medium text-blue-600">
                      {appointment.booking_reference}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.users?.full_name || appointment.patient_name}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.patient_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.doctors ? `Dr. ${appointment.doctors.full_name}` : "—"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.doctors?.specialization ?? ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-green-600">
                    PKR {appointment.consultation_fee?.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    {appointment.payment_status === "completed" ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Paid</span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700 capitalize">
                        {appointment.payment_status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(appointment.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <Link
                        href={`/admin/appointments/${appointment.id}`}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
