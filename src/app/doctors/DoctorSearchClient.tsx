"use client";

import { useState } from "react";
import Link from "next/link";
import DoctorsMap from "@/components/maps/DoctorsMap";
import {
  Star,
  MapPin,
  Languages,
  SlidersHorizontal,
  List,
  Map,
  ChevronLeft,
  ChevronRight,
  X,
  Stethoscope,
  Clock,
  Filter,
} from "lucide-react";

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
  clinic_location: { latitude: number; longitude: number } | null;
}

interface Specialization {
  name: string;
}

interface Props {
  doctors: Doctor[];
  specializations: Specialization[];
  initialParams: any;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
];

const SELECT_CLASS =
  "mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none";

export default function DoctorSearchClient({
  doctors,
  specializations,
  initialParams,
  totalCount,
  currentPage,
  pageSize,
}: Props) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (initialParams.specialization)
      p.set("specialization", initialParams.specialization);
    if (initialParams.city) p.set("city", initialParams.city);
    if (initialParams.gender) p.set("gender", initialParams.gender);
    if (initialParams.minRating) p.set("minRating", initialParams.minRating);
    if (initialParams.maxFee) p.set("maxFee", initialParams.maxFee);
    if (initialParams.language) p.set("language", initialParams.language);
    if (initialParams.sortBy) p.set("sortBy", initialParams.sortBy);
    p.set("page", String(page));
    return `/doctors?${p.toString()}`;
  }

  const doctorsWithLocations = doctors.filter(
    (d) => d.clinic_location !== null
  ) as (Doctor & {
    clinic_location: { latitude: number; longitude: number };
  })[];

  const hasActiveFilters =
    initialParams.specialization ||
    initialParams.city ||
    initialParams.gender ||
    initialParams.minRating ||
    initialParams.maxFee ||
    initialParams.language;

  const FilterPanel = () => (
    <form method="get" className="space-y-4">
      <input type="hidden" name="page" value="1" />

      {[
        {
          label: "Specialization",
          name: "specialization",
          defaultValue: initialParams.specialization || "",
          options: [
            { value: "", label: "All Specializations" },
            ...specializations.map((s) => ({ value: s.name, label: s.name })),
          ],
        },
        {
          label: "City",
          name: "city",
          defaultValue: initialParams.city || "",
          options: [
            { value: "", label: "All Cities" },
            ...CITIES.map((c) => ({ value: c, label: c })),
          ],
        },
        {
          label: "Gender",
          name: "gender",
          defaultValue: initialParams.gender || "",
          options: [
            { value: "", label: "Any" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
        {
          label: "Minimum Rating",
          name: "minRating",
          defaultValue: initialParams.minRating || "",
          options: [
            { value: "", label: "Any Rating" },
            { value: "4.5", label: "4.5+ Stars" },
            { value: "4.0", label: "4.0+ Stars" },
            { value: "3.5", label: "3.5+ Stars" },
          ],
        },
        {
          label: "Max Fee",
          name: "maxFee",
          defaultValue: initialParams.maxFee || "",
          options: [
            { value: "", label: "Any Fee" },
            { value: "1000", label: "Up to PKR 1,000" },
            { value: "2000", label: "Up to PKR 2,000" },
            { value: "3000", label: "Up to PKR 3,000" },
            { value: "5000", label: "Up to PKR 5,000" },
          ],
        },
        {
          label: "Language",
          name: "language",
          defaultValue: initialParams.language || "",
          options: [
            { value: "", label: "Any Language" },
            { value: "English", label: "English" },
            { value: "Urdu", label: "Urdu" },
            { value: "Punjabi", label: "Punjabi" },
            { value: "Sindhi", label: "Sindhi" },
          ],
        },
        {
          label: "Sort By",
          name: "sortBy",
          defaultValue: initialParams.sortBy || "rating",
          options: [
            { value: "rating", label: "Highest Rated" },
            { value: "fee_low", label: "Lowest Fee" },
            { value: "fee_high", label: "Highest Fee" },
            { value: "experience", label: "Most Experience" },
          ],
        },
      ].map((field) => (
        <div key={field.name}>
          <label
            className="block text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--text-dark)" }}
          >
            {field.label}
          </label>
          <select
            name={field.name}
            defaultValue={field.defaultValue}
            className={SELECT_CLASS}
            style={{
              borderColor: "var(--primary-light)",
              color: "var(--text-dark)",
            }}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        type="submit"
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        Apply Filters
      </button>

      {hasActiveFilters && (
        <Link
          href="/doctors"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all hover:bg-gray-50"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          <X size={13} /> Clear Filters
        </Link>
      )}
    </form>
  );

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div
          className="sticky top-20 rounded-2xl bg-white p-5"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={15} style={{ color: "var(--primary)" }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-dark)" }}
            >
              Filters
            </p>
            {hasActiveFilters && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                }}
              >
                Active
              </span>
            )}
          </div>
          <FilterPanel />
        </div>
      </aside>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white p-5 lg:hidden"
            style={{ borderRight: "1px solid var(--primary-light)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p
                className="font-display font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                Filters
              </p>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </>
      )}

      {/* Results */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium lg:hidden"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
              }}
            >
              <Filter size={13} /> Filters
              {hasActiveFilters && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--primary)", color: "white" }}
                >
                  !
                </span>
              )}
            </button>
            <p className="text-sm text-gray-500">
              <span
                className="font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                {totalCount}
              </span>{" "}
              doctor{totalCount !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <span className="text-gray-400">
                  {" "}
                  · Page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          </div>

          {/* View toggle */}
          <div
            className="flex rounded-xl p-1"
            style={{
              background: "white",
              border: "1px solid var(--primary-light)",
            }}
          >
            {[
              { mode: "list" as const, icon: List, label: "List" },
              { mode: "map" as const, icon: Map, label: "Map" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={
                  viewMode === mode
                    ? {
                        background:
                          "linear-gradient(135deg, var(--primary), var(--accent))",
                        color: "white",
                      }
                    : { color: "rgba(0,0,0,0.4)" }
                }
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { key: "specialization", label: initialParams.specialization },
              { key: "city", label: initialParams.city },
              { key: "gender", label: initialParams.gender },
              {
                key: "minRating",
                label: initialParams.minRating
                  ? `${initialParams.minRating}+ stars`
                  : null,
              },
              {
                key: "maxFee",
                label: initialParams.maxFee
                  ? `Max PKR ${initialParams.maxFee}`
                  : null,
              },
              { key: "language", label: initialParams.language },
            ]
              .filter((f) => f.label)
              .map((f) => (
                <span
                  key={f.key}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                  }}
                >
                  {f.label}
                </span>
              ))}
          </div>
        )}

        {/* Map view */}
        {viewMode === "map" ? (
          doctorsWithLocations.length > 0 ? (
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <DoctorsMap doctors={doctorsWithLocations} />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "var(--primary-light)" }}
              >
                <Map size={22} style={{ color: "var(--primary)" }} />
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-dark)" }}
              >
                No location data available
              </p>
              <button
                onClick={() => setViewMode("list")}
                className="mt-3 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Switch to List View
              </button>
            </div>
          )
        ) : (
          /* List view */
          <div className="space-y-4">
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="group overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ border: "1px solid var(--primary-light)" }}
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Avatar */}
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <Stethoscope
                        size={26}
                        style={{ color: "var(--primary)" }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="font-display text-base font-bold"
                            style={{ color: "var(--text-dark)" }}
                          >
                            Dr. {doc.full_name}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: "var(--accent)" }}
                          >
                            {doc.specialization}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {doc.qualification} · {doc.experience} yrs exp
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className="font-display text-lg font-bold"
                            style={{ color: "#059669" }}
                          >
                            PKR {doc.consultation_fee.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">per visit</p>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star
                            size={11}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="font-medium">
                            {doc.average_rating.toFixed(1)}
                          </span>
                          <span className="text-gray-400">
                            ({doc.total_reviews})
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {doc.city}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Languages
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {doc.languages.join(", ")}
                        </span>
                      </div>

                      {doc.bio && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">
                          {doc.bio}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <Link
                          href={`/doctors/${doc.id}`}
                          className="rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-blue-50"
                          style={{
                            borderColor: "var(--primary-light)",
                            color: "var(--primary)",
                          }}
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/booking/${doc.id}`}
                          className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--primary), var(--accent))",
                          }}
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Stethoscope size={22} style={{ color: "var(--primary)" }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  No doctors found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Try adjusting your filters
                </p>
                <Link
                  href="/doctors"
                  className="mt-4 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                  }}
                >
                  Clear All Filters
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && viewMode === "list" && (
          <div className="mt-8 flex items-center justify-center gap-1.5">
            <Link
              href={buildPageUrl(currentPage - 1)}
              aria-disabled={currentPage <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:bg-white"
              style={
                currentPage <= 1
                  ? {
                      borderColor: "var(--primary-light)",
                      color: "#d1d5db",
                      pointerEvents: "none",
                    }
                  : {
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }
              }
            >
              <ChevronLeft size={15} />
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageUrl(item as number)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold transition-all"
                    style={
                      item === currentPage
                        ? {
                            background:
                              "linear-gradient(135deg, var(--primary), var(--accent))",
                            color: "white",
                            border: "none",
                          }
                        : {
                            borderColor: "var(--primary-light)",
                            color: "var(--text-dark)",
                          }
                    }
                  >
                    {item}
                  </Link>
                )
              )}

            <Link
              href={buildPageUrl(currentPage + 1)}
              aria-disabled={currentPage >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:bg-white"
              style={
                currentPage >= totalPages
                  ? {
                      borderColor: "var(--primary-light)",
                      color: "#d1d5db",
                      pointerEvents: "none",
                    }
                  : {
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }
              }
            >
              <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
