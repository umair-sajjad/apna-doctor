"use client";

import { useState } from "react";
import Link from "next/link";
import DoctorsMap from "@/components/maps/DoctorsMap";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  experience: number;
  city: string;
  clinic_name: string;
  clinic_address: string;
  consultation_fee: number;
  average_rating: number;
  total_reviews: number;
  languages: string[];
  bio: string | null;
  gender: string | null;
  clinic_location: {
    latitude: number;
    longitude: number;
  } | null;
}

interface Specialization {
  name: string;
}

interface DoctorSearchClientProps {
  doctors: Doctor[];
  specializations: Specialization[];
  initialParams: any;
}

export default function DoctorSearchClient({
  doctors,
  specializations,
  initialParams,
}: DoctorSearchClientProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Filter doctors with locations for map view
  const doctorsWithLocations = doctors.filter(
    (d) => d.clinic_location !== null
  ) as (Doctor & {
    clinic_location: { latitude: number; longitude: number };
  })[];

  return (
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
                defaultValue={initialParams.specialization || ""}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
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
                defaultValue={initialParams.city || ""}
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
                defaultValue={initialParams.gender || ""}
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
                defaultValue={initialParams.minRating || ""}
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
                defaultValue={initialParams.maxFee || ""}
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
                defaultValue={initialParams.language || ""}
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
                defaultValue={initialParams.sortBy || "rating"}
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
            Found {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          <>
            {doctorsWithLocations.length > 0 ? (
              <DoctorsMap doctors={doctorsWithLocations} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-600">
                  No doctors with location data available for map view
                </p>
                <button
                  onClick={() => setViewMode("list")}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Switch to List View
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
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
                        <p className="text-gray-600">{doctor.specialization}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {doctor.qualification} • {doctor.experience} years exp
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
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
                        className="rounded-md border border-blue-600 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/booking/${doctor.id}`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {doctors.length === 0 && (
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
        )}
      </div>
    </div>
  );
}
