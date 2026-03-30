import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvailabilityForm from "./AvailabilityForm";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import { Clock } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export default async function DoctorAvailabilityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, full_name")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/dashboard");

  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", user.id)
    .order("day_of_week");

  const availabilityMap = new Map(
    availability?.map((a) => [a.day_of_week, a]) ?? []
  );

  const activeDays = DAYS.filter(
    (d) => availabilityMap.get(d.value)?.is_active
  ).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />

      <div className="mx-auto max-w-4xl px-4 py-10">
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
          <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                Schedule
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
                Manage Availability
              </h1>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Set your working hours for each day of the week
              </p>
            </div>
            <div
              className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 sm:mt-0"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Clock size={14} style={{ color: "var(--accent)" }} />
              <span className="text-sm font-semibold text-white">
                {activeDays} day{activeDays !== 1 ? "s" : ""} active
              </span>
            </div>
          </div>
        </div>

        {/* Day rows */}
        <div className="space-y-3">
          {DAYS.map((day) => {
            const existing = availabilityMap.get(day.value);
            const isActive = existing?.is_active;

            return (
              <div
                key={day.value}
                className="overflow-hidden rounded-2xl bg-white"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                {isActive && (
                  <div
                    className="h-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--primary), var(--accent))",
                    }}
                  />
                )}
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {/* Day chip */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, var(--primary), var(--accent))",
                              color: "white",
                            }
                          : { background: "var(--bg-soft)", color: "#9ca3af" }
                      }
                    >
                      {day.short}
                    </div>
                    <div>
                      <p
                        className="font-display text-base font-bold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {day.label}
                      </p>
                      {isActive ? (
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: "var(--primary)" }}
                        >
                          {existing.start_time} — {existing.end_time} ·{" "}
                          {existing.slot_duration} min slots
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-gray-400">
                          Not available
                        </p>
                      )}
                    </div>
                  </div>

                  <AvailabilityForm day={day.value} existing={existing} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
