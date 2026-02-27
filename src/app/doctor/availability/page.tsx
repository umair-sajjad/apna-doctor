import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AvailabilityForm from "./AvailabilityForm";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default async function DoctorAvailabilityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/dashboard");
  }

  // Get existing availability
  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", user.id)
    .order("day_of_week");

  // Create a map for easy lookup
  const availabilityMap = new Map(
    availability?.map((a) => [a.day_of_week, a]) || []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              ApnaDoctor - Doctor Portal
            </h1>
            <nav className="flex gap-4">
              <Link href="/doctor/dashboard" className="text-gray-600">
                Dashboard
              </Link>
              <Link href="/doctor/appointments" className="text-gray-600">
                Appointments
              </Link>
              <Link
                href="/doctor/availability"
                className="font-medium text-blue-600"
              >
                Availability
              </Link>
              <Link href="/doctor/profile" className="text-gray-600">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-3xl font-bold">Manage Availability</h2>
        <p className="mt-2 text-gray-600">
          Set your working hours for each day of the week
        </p>

        {/* Availability Schedule */}
        <div className="mt-8 space-y-4">
          {DAYS.map((day) => {
            const existing = availabilityMap.get(day.value);
            return (
              <div
                key={day.value}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{day.label}</h3>
                    {existing && existing.is_active ? (
                      <p className="mt-1 text-sm text-gray-600">
                        {existing.start_time} - {existing.end_time} (
                        {existing.slot_duration} min slots)
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        Not available
                      </p>
                    )}
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
