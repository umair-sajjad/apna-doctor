import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Calendar, CreditCard } from "lucide-react";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function RecentActivity() {
  const [{ data: recentAppointments }, { data: recentPayments }] = await Promise.all([
    adminSupabase
      .from("appointments")
      .select("id, created_at, status, patient_name, appointment_date, appointment_time, doctors(full_name), users(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    adminSupabase
      .from("payment_transactions")
      .select("id, amount, paid_at, status, appointments(patient_name, booking_reference, doctors(full_name))")
      .eq("status", "succeeded")
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  const STATUS_STYLE: Record<string, string> = {
    confirmed:  "bg-green-100 text-green-700",
    completed:  "bg-blue-100 text-blue-700",
    pending:    "bg-yellow-100 text-yellow-700",
    cancelled:  "bg-red-100 text-red-700",
    no_show:    "bg-gray-100 text-gray-600",
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Recent Appointments */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Appointments</h2>
          </div>
          <Link href="/admin/appointments" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentAppointments ?? []).map((appt) => (
            <div key={appt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {(appt as any).users?.full_name ?? appt.patient_name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  Dr. {(appt as any).doctors?.full_name} · {timeAgo(appt.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                  STATUS_STYLE[appt.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {appt.status}
              </span>
            </div>
          ))}
          {(recentAppointments?.length ?? 0) === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No appointments yet</p>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-500" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <Link href="/admin/payments" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentPayments ?? []).map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {(tx as any).appointments?.patient_name ?? "—"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  Dr. {(tx as any).appointments?.doctors?.full_name ?? "—"} ·{" "}
                  {tx.paid_at ? timeAgo(tx.paid_at) : "—"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-green-600">
                PKR {(tx as any).amount?.toLocaleString()}
              </span>
            </div>
          ))}
          {(recentPayments?.length ?? 0) === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No payments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
