import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import {
  TrendingUp,
  CalendarDays,
  Users,
  Star,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default async function DoctorAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/doctor");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/login/doctor");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: allAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: false });

  const { data: monthAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .gte(
      "appointment_date",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    )
    .lt(
      "appointment_date",
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`
    );

  const { data: paidAppointments } = await supabase
    .from("appointments")
    .select("consultation_fee, payment_status, appointment_date")
    .eq("doctor_id", user.id)
    .eq("payment_status", "completed");

  const totalAppointments = allAppointments?.length ?? 0;
  const completedAppointments =
    allAppointments?.filter((a) => a.status === "completed").length ?? 0;
  const cancelledAppointments =
    allAppointments?.filter((a) => a.status === "cancelled").length ?? 0;
  const upcomingAppointments =
    allAppointments?.filter(
      (a) =>
        a.status === "confirmed" && new Date(a.appointment_date) >= new Date()
    ).length ?? 0;

  const totalRevenue =
    paidAppointments?.reduce((s, a) => s + a.consultation_fee, 0) ?? 0;
  const monthRevenue =
    monthAppointments
      ?.filter((a) => a.payment_status === "completed")
      .reduce((s, a) => s + a.consultation_fee, 0) ?? 0;

  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const monthStart = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = `${date.getFullYear()}-${String(date.getMonth() + 2).padStart(2, "0")}-01`;
    const revenue =
      paidAppointments
        ?.filter(
          (a) =>
            a.appointment_date >= monthStart && a.appointment_date < monthEnd
        )
        .reduce((s, a) => s + a.consultation_fee, 0) ?? 0;
    monthlyRevenue.push({
      month: date.toLocaleString("default", { month: "short" }),
      revenue,
    });
  }

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*, users(full_name), appointments(appointment_date)")
    .eq("doctor_id", user.id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: paymentHistory } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .eq("payment_status", "completed")
    .order("updated_at", { ascending: false })
    .limit(20);

  const completionRate =
    totalAppointments > 0
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : "0.0";

  const statCards = [
    {
      label: "Total Revenue",
      value: `PKR ${totalRevenue.toLocaleString()}`,
      sub: `${completedAppointments} completed appts`,
      icon: TrendingUp,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      label: "This Month",
      value: `PKR ${monthRevenue.toLocaleString()}`,
      sub: `${monthAppointments?.length ?? 0} appointments`,
      icon: CalendarDays,
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      label: "Total Patients",
      value: String(totalAppointments),
      sub: `${completionRate}% completion rate`,
      icon: Users,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
    {
      label: "Average Rating",
      value: doctor.average_rating.toFixed(1),
      sub: `${doctor.total_reviews} reviews`,
      icon: Star,
      color: "#d97706",
      bg: "#fef3c7",
    },
  ];

  const statusRows = [
    {
      label: "Completed",
      count: completedAppointments,
      color: "#059669",
      icon: CheckCircle2,
    },
    {
      label: "Upcoming",
      count: upcomingAppointments,
      color: "var(--primary)",
      icon: Clock,
    },
    {
      label: "Cancelled",
      count: cancelledAppointments,
      color: "#dc2626",
      icon: XCircle,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-8"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Performance
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
              Analytics Dashboard
            </h1>
            <p
              className="mt-0.5 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Your practice insights at a glance
            </p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="absolute top-0 right-0 left-0 h-0.5 rounded-t-2xl"
                style={{ background: card.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <p
                    className="font-display mt-2 text-2xl font-bold"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: card.bg }}
                >
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue trend */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Revenue Trend — Last 6 Months
              </p>
            </div>
            <div className="space-y-3">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span
                    className="w-10 shrink-0 text-xs font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {item.month}
                  </span>
                  <div
                    className="flex-1 overflow-hidden rounded-full"
                    style={{
                      background: "var(--primary-light)",
                      height: "10px",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                        background:
                          "linear-gradient(90deg, var(--primary), var(--accent))",
                        minWidth: item.revenue > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span
                    className="w-28 shrink-0 text-right text-xs font-semibold"
                    style={{ color: "#059669" }}
                  >
                    {item.revenue > 0
                      ? `PKR ${item.revenue.toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment stats */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Appointment Statistics
              </p>
            </div>
            <div className="space-y-5">
              {statusRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <row.icon size={13} style={{ color: row.color }} />
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {row.label}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: row.color }}
                    >
                      {row.count}
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-full"
                    style={{
                      background: "var(--primary-light)",
                      height: "8px",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          totalAppointments > 0
                            ? `${(row.count / totalAppointments) * 100}%`
                            : "0%",
                        background: row.color,
                        minWidth: row.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              ))}

              <div
                className="mt-4 rounded-xl p-4"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--primary-light)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    All-time Completion Rate
                  </span>
                  <span
                    className="font-display text-xl font-bold"
                    style={{ color: "#059669" }}
                  >
                    {completionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div
          className="mb-6 overflow-hidden rounded-2xl bg-white"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div
            className="flex items-center gap-2 border-b px-6 py-4"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <CreditCard size={15} style={{ color: "var(--primary)" }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Recent Payment History
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--primary-light)" }}>
                  {["Date", "Patient", "Reference", "Amount", "Status"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold tracking-wide uppercase ${i >= 3 ? (i === 3 ? "text-right" : "text-center") : "text-left"}`}
                        style={{ color: "var(--text-dark)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paymentHistory?.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: "1px solid var(--primary-light)" }}
                  >
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(payment.appointment_date).toLocaleDateString(
                        "en-PK",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td
                      className="px-6 py-3 text-sm font-medium"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {payment.patient_name}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-400">
                      {payment.booking_reference}
                    </td>
                    <td
                      className="px-6 py-3 text-right text-sm font-bold"
                      style={{ color: "#059669" }}
                    >
                      PKR {payment.consultation_fee.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: "#d1fae5", color: "#059669" }}
                      >
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
                {(!paymentHistory || paymentHistory.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      No payment history yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent reviews */}
        <div
          className="rounded-2xl bg-white"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div
            className="flex items-center gap-2 border-b px-6 py-4"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <Star size={15} style={{ color: "var(--primary)" }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Recent Reviews
            </p>
          </div>
          <div
            className="divide-y px-6"
            style={{ borderColor: "var(--primary-light)" }}
          >
            {recentReviews && recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--primary-light)" }}
                      >
                        <Users size={13} style={{ color: "var(--primary)" }} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {review.users?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-PK",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="mt-2 pl-11 text-sm leading-relaxed text-gray-500">
                      {review.review_text}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star
                  size={24}
                  className="mb-2 opacity-20"
                  style={{ color: "var(--primary)" }}
                />
                <p className="text-sm text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
