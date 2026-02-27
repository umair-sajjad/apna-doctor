import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VerificationActions from "./VerificationActions";

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    redirect("/dashboard");
  }

  let query = supabase
    .from("doctors")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.status === "pending") {
    query = query.eq("is_verified", false);
  } else if (params.status === "verified") {
    query = query.eq("is_verified", true);
  }

  const { data: doctors } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              ApnaDoctor - Admin Panel
            </h1>
            <nav className="flex gap-4">
              <Link href="/admin/dashboard" className="text-gray-600">
                Dashboard
              </Link>
              <Link href="/admin/doctors" className="font-medium text-blue-600">
                Doctors
              </Link>
              <Link href="/admin/appointments" className="text-gray-600">
                Appointments
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-black">Manage Doctors</h2>

        {/* Filters */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/admin/doctors"
            className={`rounded-md px-4 py-2 ${
              !params.status
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            All Doctors
          </Link>
          <Link
            href="/admin/doctors?status=pending"
            className={`rounded-md px-4 py-2 ${
              params.status === "pending"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            Pending Verification
          </Link>
          <Link
            href="/admin/doctors?status=verified"
            className={`rounded-md px-4 py-2 ${
              params.status === "verified"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            Verified
          </Link>
        </div>

        {/* Doctors List */}
        <div className="mt-6 space-y-4">
          {doctors?.map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-black">
                      Dr. {doctor.full_name}
                    </h3>
                    {doctor.is_verified && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-black">
                    <p>
                      <strong>Specialization:</strong> {doctor.specialization}
                    </p>
                    <p>
                      <strong>Qualification:</strong> {doctor.qualification}
                    </p>
                    <p>
                      <strong>PMDC Number:</strong> {doctor.pmdc_number}
                    </p>
                    <p>
                      <strong>Experience:</strong> {doctor.experience} years
                    </p>
                    <p>
                      <strong>Clinic:</strong> {doctor.clinic_name},{" "}
                      {doctor.city}
                    </p>
                    <p>
                      <strong>Email:</strong> {doctor.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {doctor.phone}
                    </p>
                  </div>
                </div>
                {!doctor.is_verified && (
                  <VerificationActions doctorId={doctor.id} />
                )}
              </div>
            </div>
          ))}

          {doctors?.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No doctors found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
