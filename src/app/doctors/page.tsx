import { createClient } from "@/lib/supabase/server";
import DoctorSearchClient from "./DoctorSearchClient";
import UserNavbar from "@/components/shared/UserNavbar";

const PAGE_SIZE = 9;

interface SearchParams {
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

export const metadata = {
  title: "Find Doctors - ApnaDoctor",
  description:
    "Search and book verified PMDC doctors across Pakistan. Filter by specialty, location, and availability.",
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Use the search_doctors RPC for consistent ranking between SSR and live search
  const { data: rpcData, error } = await supabase.rpc("search_doctors", {
    p_query: params.q?.trim() ?? "",
    p_spec: params.specialization || null,
    p_city: params.city || null,
    p_gender: params.gender || null,
    p_min_rating: params.minRating ? parseFloat(params.minRating) : null,
    p_max_fee: params.maxFee ? parseInt(params.maxFee, 10) : null,
    p_language: params.language || null,
    p_sort_by: params.sortBy || "rating",
    p_offset: offset,
    p_limit: PAGE_SIZE,
  });

  const count = Number((rpcData as any[])?.[0]?.total_count ?? 0);
  const rawDoctors = (rpcData ?? []).map(({ total_count: _tc, ...doc }: any) => doc);

  // Enrich with clinic_location for the map view
  const doctorsWithLocations = await Promise.all(
    rawDoctors.map(async (doctor: Record<string, unknown>) => {
      if (doctor.clinic_location !== undefined && doctor.clinic_location !== null) {
        const { data: locationData } = await supabase.rpc("get_doctor_location", {
          doctor_id: doctor.id,
        });
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
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />

      {/* Page header */}
      <div
        className="relative overflow-hidden border-b py-10"
        style={{
          background: "var(--text-dark)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Browse & Book
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-white">
            Find Doctors
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {count} verified PMDC-registered doctor{count !== 1 ? "s" : ""} available
            {params.q && (
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                {" "}· results for &ldquo;{params.q}&rdquo;
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error ? (
          <div
            className="rounded-2xl p-6 text-sm"
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#dc2626",
            }}
          >
            Error loading doctors: {error.message}
          </div>
        ) : (
          <DoctorSearchClient
            doctors={doctorsWithLocations}
            specializations={specializations || []}
            initialParams={params}
            totalCount={count}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </div>
  );
}
