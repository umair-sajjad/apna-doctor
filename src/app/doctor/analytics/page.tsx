import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoctorNavbar from "@/components/shared/DoctorNavbar";

export default async function DoctorAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/doctor");
  }

  // Get doctor info
  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/login/doctor");
  }

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get all appointments
  const { data: allAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: false });

  // Get this month's appointments
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

  // Get revenue data
  const { data: paidAppointments } = await supabase
    .from("appointments")
    .select("consultation_fee, payment_status, appointment_date")
    .eq("doctor_id", user.id)
    .eq("payment_status", "completed");

  // Calculate statistics
  const totalAppointments = allAppointments?.length || 0;
  const completedAppointments =
    allAppointments?.filter((a) => a.status === "completed").length || 0;
  const cancelledAppointments =
    allAppointments?.filter((a) => a.status === "cancelled").length || 0;
  const upcomingAppointments =
    allAppointments?.filter(
      (a) =>
        a.status === "confirmed" && new Date(a.appointment_date) >= new Date()
    ).length || 0;

  const totalRevenue =
    paidAppointments?.reduce((sum, a) => sum + a.consultation_fee, 0) || 0;
  const monthRevenue =
    monthAppointments
      ?.filter((a) => a.payment_status === "completed")
      .reduce((sum, a) => sum + a.consultation_fee, 0) || 0;

  // Get last 6 months revenue
  const monthlyRevenue: Array<{ month: string; revenue: number }> = [];
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
        .reduce((sum, a) => sum + a.consultation_fee, 0) || 0;

    monthlyRevenue.push({
      month: date.toLocaleString("default", { month: "short" }),
      revenue,
    });
  }

  // Get recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*, users(full_name), appointments(appointment_date)")
    .eq("doctor_id", user.id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // Payment history (last 20 transactions)
  const { data: paymentHistory } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .eq("payment_status", "completed")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-black">
          Analytics Dashboard
        </h1>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  PKR {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  PKR {monthRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalAppointments}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ⭐ {doctor.average_rating.toFixed(1)}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-black">
              Revenue Trend (Last 6 Months)
            </h2>
            <div className="space-y-3">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{item.month}</div>
                  <div className="relative h-8 flex-1 rounded-full bg-gray-200">
                    <div
                      className="flex h-8 items-center justify-end rounded-full bg-green-500 pr-3 text-sm font-medium text-white"
                      style={{
                        width: `${(item.revenue / Math.max(...monthlyRevenue.map((m) => m.revenue))) * 100}%`,
                      }}
                    >
                      {item.revenue > 0 &&
                        `PKR ${item.revenue.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-black">
              Appointment Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">
                  {completedAppointments}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{
                    width: `${(completedAppointments / totalAppointments) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold text-blue-600">
                  {upcomingAppointments}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{
                    width: `${(upcomingAppointments / totalAppointments) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-red-600">
                  {cancelledAppointments}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-red-500"
                  style={{
                    width: `${(cancelledAppointments / totalAppointments) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-black">
            Recent Payment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory?.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-black">
                      {new Date(payment.appointment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {payment.patient_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {payment.booking_reference}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                      PKR {payment.consultation_fee}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-black">
            Recent Reviews
          </h2>
          <div className="space-y-4">
            {recentReviews?.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium text-black">
                    {review.users?.full_name || "Anonymous"}
                  </div>
                  <div className="text-yellow-500">
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-sm text-gray-600">{review.review_text}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
