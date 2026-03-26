import { createClient } from "@/lib/supabase/server";

export default async function RecentActivity() {
  const supabase = await createClient();

  // Get recent appointments
  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      doctors(full_name),
      users(full_name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const activities = recentAppointments?.map((appt) => {
    const now = new Date();
    const created = new Date(appt.created_at);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    let timeAgo = "";
    if (diffMinutes < 60) {
      timeAgo = `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      timeAgo = `${Math.floor(diffMinutes / 1440)}d ago`;
    }

    return {
      id: appt.id,
      type: "appointment",
      user: appt.users?.full_name || appt.patient_name,
      action: `booked appointment with Dr. ${appt.doctors.full_name}`,
      time: timeAgo,
      status: appt.status,
    };
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Deployments
        </h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all →
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Latest deployment activity across services
      </div>

      <div className="space-y-3">
        {activities?.slice(0, 8).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-sm text-green-600">✓</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-gray-600">{activity.action}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
            </div>
            <div>
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                  activity.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : activity.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {activity.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
