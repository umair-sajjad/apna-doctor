import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

        <div className="mt-6 flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-black">Filters</h3>

              <form method="get" className="mt-4 space-y-4">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.specialization || ""}
                  >
                    <option value="">All Specializations</option>
                    {specializations?.map((spec) => (
                      <option key={spec.name} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    City
                  </label>
                  <select
                    name="city"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.city || ""}
                  >
                    <option value="">All Cities</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.gender || ""}
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Minimum Rating
                  </label>
                  <select
                    name="minRating"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.minRating || ""}
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ ⭐</option>
                    <option value="4.0">4.0+ ⭐</option>
                    <option value="3.5">3.5+ ⭐</option>
                    <option value="3.0">3.0+ ⭐</option>
                  </select>
                </div>

                {/* Max Fee */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Max Consultation Fee
                  </label>
                  <select
                    name="maxFee"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.maxFee || ""}
                  >
                    <option value="">Any Fee</option>
                    <option value="1000">Up to PKR 1,000</option>
                    <option value="2000">Up to PKR 2,000</option>
                    <option value="3000">Up to PKR 3,000</option>
                    <option value="5000">Up to PKR 5,000</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Language
                  </label>
                  <select
                    name="language"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.language || ""}
                  >
                    <option value="">Any Language</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Sindhi">Sindhi</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-black">
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                    defaultValue={params.sortBy || "rating"}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="fee_low">Lowest Fee</option>
                    <option value="fee_high">Highest Fee</option>
                    <option value="experience">Most Experience</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>

                <Link
                  href="/doctors"
                  className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </Link>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {doctors?.length || 0} doctors
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-800">
                Error: {error.message}
              </div>
            )}

            <div className="space-y-4">
              {doctors?.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="flex gap-4">
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 text-4xl">
                      👨‍⚕️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-black">
                            Dr. {doctor.full_name}
                          </h3>
                          <p className="text-gray-600">
                            {doctor.specialization}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {doctor.qualification} • {doctor.experience} years
                            exp
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            PKR {doctor.consultation_fee}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-yellow-600">
                          ⭐ {doctor.average_rating.toFixed(1)} (
                          {doctor.total_reviews} reviews)
                        </span>
                        <span className="text-gray-600">📍 {doctor.city}</span>
                        <span className="text-gray-600">
                          🗣️ {doctor.languages.join(", ")}
                        </span>
                        {doctor.gender && (
                          <span className="text-gray-600">
                            {doctor.gender === "male" ? "👨‍⚕️" : "👩‍⚕️"}{" "}
                            {doctor.gender}
                          </span>
                        )}
                      </div>

                      {doctor.bio && (
                        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                          {doctor.bio}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="rounded-md border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/booking/${doctor.id}`}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {doctors?.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-600">
                    No doctors found matching your criteria
                  </p>
                  <Link
                    href="/doctors"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                  >
                    Clear filters and try again
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
