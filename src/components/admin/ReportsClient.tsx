"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
} from "lucide-react";

type ReportType = "users" | "revenue" | "appointments" | "doctors" | "payments";
type RangeOption = "7d" | "30d" | "3m" | "1y" | "all";

const REPORTS: {
  type: ReportType;
  title: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    type: "users",
    title: "User Activity Report",
    description: "Patient registrations with contact info and join dates",
    Icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    type: "revenue",
    title: "Revenue Report",
    description: "Successful payments broken down by doctor, specialty, and date",
    Icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    type: "appointments",
    title: "Appointment Analytics",
    description: "All bookings with status, fees, doctor, and patient details",
    Icon: Calendar,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    type: "doctors",
    title: "Doctor Performance",
    description: "Per-doctor stats: appointments, ratings, reviews, and revenue",
    Icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    type: "payments",
    title: "Payment Transactions",
    description: "Full payment log including failed and pending transactions",
    Icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

const RANGE_LABELS: Record<RangeOption, string> = {
  "7d":  "Last 7 Days",
  "30d": "Last 30 Days",
  "3m":  "Last 3 Months",
  "1y":  "Last Year",
  "all": "All Time",
};

function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.click();
}

export default function ReportsClient() {
  const [loading, setLoading] = useState<ReportType | null>(null);
  const [done, setDone]       = useState<ReportType | null>(null);

  // Custom builder state
  const [customType,  setCustomType]  = useState<ReportType>("users");
  const [customRange, setCustomRange] = useState<RangeOption>("30d");
  const [customBusy,  setCustomBusy]  = useState(false);

  async function exportReport(type: ReportType, range: RangeOption = "all") {
    setLoading(type);
    setDone(null);
    try {
      triggerDownload(`/api/admin/reports/export?type=${type}&range=${range}`);
      setTimeout(() => {
        setLoading(null);
        setDone(type);
        setTimeout(() => setDone(null), 2500);
      }, 800);
    } catch {
      setLoading(null);
    }
  }

  async function handleCustomExport() {
    setCustomBusy(true);
    triggerDownload(`/api/admin/reports/export?type=${customType}&range=${customRange}`);
    setTimeout(() => setCustomBusy(false), 1000);
  }

  return (
    <div className="space-y-6">
      {/* Report cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r, i) => {
          const isLoading = loading === r.type;
          const isDone    = done === r.type;
          return (
            <motion.div
              key={r.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${r.bg}`}>
                <r.Icon className={`h-5 w-5 ${r.color}`} />
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">{r.title}</h3>
              <p className="mb-5 text-sm text-gray-500">{r.description}</p>
              <button
                onClick={() => exportReport(r.type)}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDone ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isLoading ? "Generating…" : isDone ? "Downloaded!" : "Export CSV"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-1 text-base font-semibold text-gray-900">Custom Report Builder</h2>
        <p className="mb-5 text-sm text-gray-500">
          Choose a report type and date range, then export directly to CSV.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Report Type
            </label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as ReportType)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-8 text-sm text-gray-800 focus:border-blue-400 focus:outline-none"
            >
              {REPORTS.map((r) => (
                <option key={r.type} value={r.type}>{r.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Date Range
            </label>
            <select
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value as RangeOption)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-8 text-sm text-gray-800 focus:border-blue-400 focus:outline-none"
            >
              {(Object.entries(RANGE_LABELS) as [RangeOption, string][]).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCustomExport}
              disabled={customBusy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {customBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {customBusy ? "Generating…" : "Generate & Export"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          All exports are in CSV format. Open with Excel, Google Sheets, or any spreadsheet app.
        </p>
      </motion.div>
    </div>
  );
}
