"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Filter,
  Search,
  Loader2,
  MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface InitialParams {
  q?: string;
  specialization?: string;
  city?: string;
  gender?: string;
  minRating?: string;
  maxFee?: string;
  language?: string;
  sortBy?: string;
  page?: string;
}

interface Props {
  doctors: Doctor[];
  specializations: Specialization[];
  initialParams: InitialParams;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoggedIn: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Highlight helper ─────────────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text ?? ""}</>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  // Reset regex lastIndex for the test calls below
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ||
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded bg-yellow-100 px-0.5 font-semibold not-italic text-yellow-900"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoctorSearchClient({
  doctors,
  specializations,
  initialParams,
  totalCount,
  currentPage,
  pageSize,
  isLoggedIn,
}: Props) {
  const router = useRouter();

  // ── View state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(initialParams.q ?? "");
  const [isSearching, setIsSearching] = useState(false);

  // ── Display state (overridden by live search results) ───────────────────────
  const [displayDoctors, setDisplayDoctors] = useState<Doctor[]>(doctors);
  const [displayTotalCount, setDisplayTotalCount] = useState(totalCount);
  const [displayPage, setDisplayPage] = useState(currentPage);
  const [displayTotalPages, setDisplayTotalPages] = useState(
    Math.ceil(totalCount / pageSize)
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display state when server re-renders with new props
  useEffect(() => {
    setDisplayDoctors(doctors);
    setDisplayTotalCount(totalCount);
    setDisplayPage(currentPage);
    setDisplayTotalPages(Math.ceil(totalCount / pageSize));
    setSearchQuery(initialParams.q ?? "");
  }, [doctors, totalCount, currentPage, pageSize, initialParams.q]);

  // ── Core search function ────────────────────────────────────────────────────
  const performSearch = useCallback(
    async (q: string, page = 1) => {
      setIsSearching(true);
      try {
        const p = new URLSearchParams();
        if (q.trim()) p.set("q", q.trim());
        if (initialParams.specialization)
          p.set("specialization", initialParams.specialization);
        if (initialParams.city) p.set("city", initialParams.city);
        if (initialParams.gender) p.set("gender", initialParams.gender);
        if (initialParams.minRating)
          p.set("minRating", initialParams.minRating);
        if (initialParams.maxFee) p.set("maxFee", initialParams.maxFee);
        if (initialParams.language) p.set("language", initialParams.language);
        if (initialParams.sortBy) p.set("sortBy", initialParams.sortBy);
        p.set("page", String(page));

        const res = await fetch(`/api/doctors/search?${p.toString()}`);
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();

        setDisplayDoctors(data.doctors ?? []);
        setDisplayTotalCount(data.totalCount ?? 0);
        setDisplayPage(data.page ?? 1);
        setDisplayTotalPages(data.totalPages ?? 1);
      } catch {
        // On API failure, fall back to server-rendered results silently
        setDisplayDoctors(doctors);
        setDisplayTotalCount(totalCount);
        setDisplayPage(currentPage);
        setDisplayTotalPages(Math.ceil(totalCount / pageSize));
      } finally {
        setIsSearching(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialParams, doctors, totalCount, currentPage, pageSize]
  );

  // ── Input change handler (debounced) ────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      // Immediately restore server results when query is cleared
      setDisplayDoctors(doctors);
      setDisplayTotalCount(totalCount);
      setDisplayPage(currentPage);
      setDisplayTotalPages(Math.ceil(totalCount / pageSize));
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value, 1);
    }, 400);
  };

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  // ── Submit: navigate to shareable URL ──────────────────────────────────────
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const url = buildSearchUrl(searchQuery, 1);
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1); // immediate result update
      router.push(url);             // also update URL for shareability
    } else {
      router.push("/doctors");
    }
  };

  // ── Pagination: client-side when in search mode ─────────────────────────────
  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(buildPageUrl(page));
    }
  };

  // ── URL builders ────────────────────────────────────────────────────────────
  function buildSearchUrl(q: string, page = 1) {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
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

  function buildPageUrl(page: number) {
    return buildSearchUrl(searchQuery, page);
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const hasActiveFilters =
    initialParams.specialization ||
    initialParams.city ||
    initialParams.gender ||
    initialParams.minRating ||
    initialParams.maxFee ||
    initialParams.language;

  const isSearchMode = searchQuery.trim().length > 0;

  const doctorsWithLocations = displayDoctors.filter(
    (d) => d.clinic_location !== null
  ) as (Doctor & { clinic_location: { latitude: number; longitude: number } })[];

  // ── Filter panel (used in both desktop sidebar and mobile drawer) ───────────
  const FilterPanel = () => (
    <form method="get" action="/doctors" className="space-y-4">
      <input type="hidden" name="page" value="1" />
      {/* Preserve current search query when applying filters */}
      {searchQuery && <input type="hidden" name="q" value={searchQuery} />}

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

      {(hasActiveFilters || isSearchMode) && (
        <Link
          href="/doctors"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all hover:bg-gray-50"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          <X size={13} /> Clear All
        </Link>
      )}
    </form>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6">
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
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
            {(hasActiveFilters || isSearchMode) && (
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

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
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

      {/* ── Results area ─────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">

        {/* ── Search bar ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSearchSubmit} className="mb-5">
          <div className="relative">
            {/* Left icon */}
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              {isSearching ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                  style={{ color: "var(--primary)" }}
                />
              ) : (
                <Search size={17} className="text-gray-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              placeholder="Search by name, specialty, or condition…"
              className="w-full rounded-2xl border py-3.5 pr-24 pl-12 text-sm shadow-sm transition focus:outline-none focus:ring-2"
              style={{
                borderColor: searchQuery
                  ? "var(--primary)"
                  : "var(--primary-light)",
                color: "var(--text-dark)",
                background: "white",
              }}
            />

            {/* Right: clear + search button */}
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Search status line */}
          {isSearchMode && (
            <p className="mt-2 text-xs text-gray-500">
              {isSearching ? (
                <span style={{ color: "var(--primary)" }}>Searching…</span>
              ) : (
                <>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {displayTotalCount}
                  </span>{" "}
                  result{displayTotalCount !== 1 ? "s" : ""} for{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  {(hasActiveFilters) && (
                    <span className="text-gray-400"> · with active filters</span>
                  )}
                </>
              )}
            </p>
          )}
        </form>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
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
              {(hasActiveFilters || isSearchMode) && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--primary)", color: "white" }}
                >
                  !
                </span>
              )}
            </button>

            {/* Count — only shown when not in search mode (search has its own count) */}
            {!isSearchMode && (
              <p className="text-sm text-gray-500">
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {displayTotalCount}
                </span>{" "}
                doctor{displayTotalCount !== 1 ? "s" : ""} found
                {displayTotalPages > 1 && (
                  <span className="text-gray-400">
                    {" "}
                    · Page {displayPage} of {displayTotalPages}
                  </span>
                )}
              </p>
            )}
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

        {/* ── Active filter chips ──────────────────────────────────────────────── */}
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

        {/* ── Map view ─────────────────────────────────────────────────────────── */}
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
          /* ── List view ──────────────────────────────────────────────────────── */
          <div className="space-y-4">
            {displayDoctors.length > 0 ? (
              displayDoctors.map((doc) => (
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
                            Dr.{" "}
                            <Highlight
                              text={doc.full_name}
                              query={searchQuery}
                            />
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: "var(--accent)" }}
                          >
                            <Highlight
                              text={doc.specialization}
                              query={searchQuery}
                            />
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
                          <Highlight text={doc.city} query={searchQuery} />
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
                          <Highlight text={doc.bio} query={searchQuery} />
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
                        {isLoggedIn && (
                          <Link
                            href={`/messages?doctorId=${doc.id}`}
                            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:bg-blue-50"
                            style={{
                              borderColor: "var(--primary-light)",
                              color: "var(--primary)",
                            }}
                          >
                            <MessageCircle size={12} /> Message
                          </Link>
                        )}
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
              /* Empty state */
              <div
                className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Search size={22} style={{ color: "var(--primary)" }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {isSearchMode
                    ? `No doctors found for "${searchQuery}"`
                    : "No doctors found"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {isSearchMode
                    ? "Try a different name, specialty, or symptom"
                    : "Try adjusting your filters"}
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

        {/* ── Pagination ────────────────────────────────────────────────────────── */}
        {displayTotalPages > 1 && viewMode === "list" && (
          <div className="mt-8 flex items-center justify-center gap-1.5">
            <button
              onClick={() => handlePageChange(displayPage - 1)}
              disabled={displayPage <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:bg-white disabled:pointer-events-none"
              style={{
                borderColor: "var(--primary-light)",
                color: displayPage <= 1 ? "#d1d5db" : "var(--text-dark)",
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: displayTotalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === displayTotalPages ||
                  Math.abs(p - displayPage) <= 2
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
                  <button
                    key={item}
                    onClick={() => handlePageChange(item as number)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold transition-all"
                    style={
                      item === displayPage
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
                  </button>
                )
              )}

            <button
              onClick={() => handlePageChange(displayPage + 1)}
              disabled={displayPage >= displayTotalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:bg-white disabled:pointer-events-none"
              style={{
                borderColor: "var(--primary-light)",
                color:
                  displayPage >= displayTotalPages
                    ? "#d1d5db"
                    : "var(--text-dark)",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
