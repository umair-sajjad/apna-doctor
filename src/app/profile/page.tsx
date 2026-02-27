import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

export default async function UserProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();

  // Redirect doctors to their profile page
  if (doctor) {
    redirect("/doctor/profile");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userData) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ApnaDoctor
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-gray-600">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600">
                My Appointments
              </Link>
              <Link href="/profile" className="font-medium text-blue-600">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">My Profile</h2>
        <p className="mt-2 text-gray-600">Manage your personal information</p>

        <ProfileForm user={userData} />
      </div>
    </div>
  );
}
