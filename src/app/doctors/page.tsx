import { createClient } from "@/lib/supabase/server";
import DoctorSearchClient from "./DoctorSearchClient";
import UserNavbar from "@/components/shared/UserNavbar";

const PAGE_SIZE = 9;

interface SearchParams {
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

  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("doctors")
    .select("*", { count: "exact" })
    .eq("is_verified", true)
    .eq("is_active", true);

  if (params.specialization)
    query = query.eq("specialization", params.specialization);
  if (params.city) query = query.eq("city", params.city);
  if (params.gender) query = query.eq("gender", params.gender);
  if (params.minRating)
    query = query.gte("average_rating", parseFloat(params.minRating));
  if (params.maxFee)
    query = query.lte("consultation_fee", parseInt(params.maxFee));
  if (params.language) query = query.contains("languages", [params.language]);

  const sortBy = params.sortBy || "rating";
  if (sortBy === "rating")
    query = query.order("average_rating", { ascending: false });
  else if (sortBy === "fee_low")
    query = query.order("consultation_fee", { ascending: true });
  else if (sortBy === "fee_high")
    query = query.order("consultation_fee", { ascending: false });
  else if (sortBy === "experience")
    query = query.order("experience", { ascending: false });

  const { data: doctors, error, count } = await query.range(from, to);

  const doctorsWithLocations = await Promise.all(
    (doctors || []).map(async (doctor) => {
      if (doctor.clinic_location) {
        const { data: locationData } = await supabase.rpc(
          "get_doctor_location",
          {
            doctor_id: doctor.id,
          }
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
            {count ?? 0} verified PMDC-registered doctors available
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
            totalCount={count || 0}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
}
