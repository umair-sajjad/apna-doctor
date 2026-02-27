import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function DoctorAnalyticsPage() {
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
              <Link href="/doctor/availability" className="text-gray-600">
                Availability
              </Link>
              <Link href="/doctor/profile" className="text-gray-600">
                Profile
              </Link>
              <Link
                href="/doctor/analytics"
                className="font-medium text-blue-600"
              >
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">Analytics & Insights</h2>
        <p className="mt-2 text-gray-600">
          Track your performance and earnings
        </p>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
