import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClinicMap from "@/components/maps/ClinicMap";

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .single();

  if (!doctor) {
    notFound();
  }

  // Get coordinates separately using raw SQL
  let clinicLocation: { latitude: number; longitude: number } | null = null;

  if (doctor.clinic_location) {
    const { data: locationData } = await supabase.rpc("get_doctor_location", {
      doctor_id: id,
    });

    if (locationData && locationData.length > 0) {
      clinicLocation = {
        latitude: locationData[0].lat,
        longitude: locationData[0].lng,
      };
    }
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, users(full_name)")
    .eq("doctor_id", id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ApnaDoctor
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Doctor Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <div className="flex gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200 text-6xl">
              👨‍⚕️
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black">
                Dr. {doctor.full_name}
              </h1>
              <p className="mt-1 text-xl text-gray-600">
                {doctor.specialization}
              </p>
              <p className="mt-2 text-gray-500">
                {doctor.qualification} • {doctor.experience} years experience
              </p>
              <div className="mt-4 flex items-center gap-6">
                <span className="text-lg text-yellow-600">
                  ⭐ {doctor.average_rating.toFixed(1)} ({doctor.total_reviews}{" "}
                  reviews)
                </span>
                <span className="text-gray-600">
                  📍 {doctor.clinic_name}, {doctor.city}
                </span>
                <span className="text-lg font-semibold text-green-600">
                  PKR {doctor.consultation_fee}
                </span>
              </div>
              {doctor.is_verified && (
                <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  ✓ PMDC Verified
                </span>
              )}
            </div>
            <div>
              <Link
                href={`/booking/${doctor.id}`}
                className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* About */}
          {doctor.bio && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-black">About</h2>
              <p className="mt-2 text-gray-600">{doctor.bio}</p>
            </div>
          )}

          {/* Clinic Info */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-black">
              Clinic Information
            </h2>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">
                <strong>Name:</strong> {doctor.clinic_name}
              </p>
              <p className="text-gray-600">
                <strong>Address:</strong> {doctor.clinic_address}
              </p>
              <p className="text-gray-600">
                <strong>Languages:</strong> {doctor.languages.join(", ")}
              </p>
            </div>
          </div>

          {/* Clinic Location Map */}
          {clinicLocation && (
            <div className="mt-8 border-t pt-6">
              <h2 className="mb-4 text-xl font-semibold text-black">
                Clinic Location
              </h2>
              <ClinicMap
                latitude={clinicLocation.latitude}
                longitude={clinicLocation.longitude}
                clinicName={doctor.clinic_name}
                clinicAddress={doctor.clinic_address}
              />
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-black">
              Patient Reviews ({doctor.total_reviews})
            </h2>
            <div className="mt-4 space-y-4">
              {reviews?.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black">
                      {review.users?.full_name || "Anonymous"}
                    </span>
                    <span className="text-yellow-600">
                      {"⭐".repeat(review.rating)}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="mt-2 text-gray-600">{review.review_text}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {reviews?.length === 0 && (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
