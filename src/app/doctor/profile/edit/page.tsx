import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DoctorProfileEditForm from "@/components/profile/DoctorProfileEditForm";

export default async function DoctorProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/doctor");
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/login/doctor");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/doctor/profile"
            className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Profile
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
          <p className="mt-1 text-gray-600">Update your professional information</p>
        </div>

        <DoctorProfileEditForm doctor={doctor} />
      </div>
    </div>
  );
}
