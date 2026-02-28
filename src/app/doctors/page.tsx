import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DoctorSearchClient from "./DoctorSearchClient";

interface SearchParams {
  specialization?: string;
  city?: string;
  gender?: string;
  minRating?: string;
  maxFee?: string;
  language?: string;
  sortBy?: string;
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("doctors")
    .select("*")
    .eq("is_verified", true)
    .eq("is_active", true);

  // Apply filters
  if (params.specialization) {
    query = query.eq("specialization", params.specialization);
  }

  if (params.city) {
    query = query.eq("city", params.city);
  }

  if (params.gender) {
    query = query.eq("gender", params.gender);
  }

  if (params.minRating) {
    query = query.gte("average_rating", parseFloat(params.minRating));
  }

  if (params.maxFee) {
    query = query.lte("consultation_fee", parseInt(params.maxFee));
  }

  if (params.language) {
    query = query.contains("languages", [params.language]);
  }

  // Apply sorting
  const sortBy = params.sortBy || "rating";
  if (sortBy === "rating") {
    query = query.order("average_rating", { ascending: false });
  } else if (sortBy === "fee_low") {
    query = query.order("consultation_fee", { ascending: true });
  } else if (sortBy === "fee_high") {
    query = query.order("consultation_fee", { ascending: false });
  } else if (sortBy === "experience") {
    query = query.order("experience", { ascending: false });
  }

  const { data: doctors, error } = await query;

  // Get coordinates for doctors with locations
  const doctorsWithLocations = await Promise.all(
    (doctors || []).map(async (doctor) => {
      if (doctor.clinic_location) {
        const { data: locationData } = await supabase.rpc(
          "get_doctor_location",
          { doctor_id: doctor.id }
        );

        if (locationData && locationData.length > 0) {
          return {
            ...doctor,
            clinic_location: {
              latitude: locationData[0].lat,
              longitude: locationData[0].lng,
            },
          };
        }
      }
      return { ...doctor, clinic_location: null };
    })
  );

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
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ApnaDoctor
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black">Find Doctors</h1>

        {error ? (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-red-800">
            Error: {error.message}
          </div>
        ) : (
          <DoctorSearchClient
            doctors={doctorsWithLocations}
            specializations={specializations || []}
            initialParams={params}
          />
        )}
      </div>
    </div>
  );
}
