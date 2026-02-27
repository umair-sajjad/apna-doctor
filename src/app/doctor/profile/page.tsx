import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

export default async function DoctorProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/dashboard");
  }

  const { data: specializations } = await supabase
    .from("specializations")
    .select("name")
    .eq("is_active", true)
    .order("name");

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
              <Link
                href="/doctor/profile"
                className="font-medium text-blue-600"
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Profile</h2>
            <p className="mt-2 text-gray-600">
              Update your professional information
            </p>
          </div>
          {doctor.is_verified && (
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              ✓ Verified
            </span>
          )}
        </div>

        <ProfileForm doctor={doctor} specializations={specializations || []} />
      </div>
    </div>
  );
}
