import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClinicMap from "@/components/maps/ClinicMap";
import Logo from "@/components/shared/logo";
import {
  ArrowLeft,
  Star,
  MapPin,
  Languages,
  Clock,
  ShieldCheck,
  Stethoscope,
  Quote,
  User,
} from "lucide-react";

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

  if (!doctor) notFound();

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

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews?.filter((r) => r.rating === star).length ?? 0,
    pct:
      reviews && reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / reviews.length) *
              100
          )
        : 0,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Minimal header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo size="sm" />
          <Link
            href="/doctors"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={14} /> Back to Doctors
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left col — sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Doctor card */}
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ background: "var(--text-dark)" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div
                  className="pointer-events-none absolute top-0 right-0 h-48 w-48 opacity-10 blur-3xl"
                  style={{ background: "var(--accent)" }}
                />

                <div className="relative z-10 p-6 text-center">
                  <div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{
                      background: "rgba(14,165,233,0.15)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <Stethoscope size={32} style={{ color: "var(--accent)" }} />
                  </div>

                  <h1 className="font-display text-xl font-bold text-white">
                    Dr. {doctor.full_name}
                  </h1>
                  <p
                    className="mt-0.5 text-sm"
                    style={{ color: "var(--accent)" }}
                  >
                    {doctor.specialization}
                  </p>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {doctor.qualification}
                  </p>

                  {doctor.is_verified && (
                    <div
                      className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: "rgba(5,150,105,0.2)",
                        color: "#34d399",
                      }}
                    >
                      <ShieldCheck size={11} /> PMDC Verified
                    </div>
                  )}

                  {/* Stats */}
                  <div
                    className="mt-5 grid grid-cols-2 gap-3 rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star
                          size={12}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="text-sm font-bold text-white">
                          {doctor.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 text-[10px]"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {doctor.total_reviews} reviews
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={12} style={{ color: "var(--accent)" }} />
                        <span className="text-sm font-bold text-white">
                          {doctor.experience} yrs
                        </span>
                      </div>
                      <p
                        className="mt-0.5 text-[10px]"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Experience
                      </p>
                    </div>
                  </div>

                  {/* Fee */}
                  <div
                    className="mt-4 rounded-xl p-3"
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Consultation Fee
                    </p>
                    <p
                      className="font-display mt-0.5 text-2xl font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      PKR {doctor.consultation_fee.toLocaleString()}
                    </p>
                  </div>

                  {/* Clinic + languages */}
                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0"
                        style={{ color: "var(--accent)" }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {doctor.clinic_name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {doctor.clinic_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Languages
                        size={13}
                        className="shrink-0"
                        style={{ color: "var(--accent)" }}
                      />
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {doctor.languages.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book CTA */}
              <Link
                href={`/booking/${doctor.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5 lg:col-span-2">
            {/* About */}
            {doctor.bio && (
              <div
                className="rounded-2xl bg-white p-6"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <p
                  className="mb-3 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  About
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {doctor.bio}
                </p>
              </div>
            )}

            {/* Clinic map */}
            {clinicLocation && (
              <div
                className="overflow-hidden rounded-2xl bg-white"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div
                  className="flex items-center gap-2 border-b px-6 py-4"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <MapPin size={15} style={{ color: "var(--primary)" }} />
                  <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--accent)" }}
                  >
                    Clinic Location
                  </p>
                </div>
                <ClinicMap
                  latitude={clinicLocation.latitude}
                  longitude={clinicLocation.longitude}
                  clinicName={doctor.clinic_name}
                  clinicAddress={doctor.clinic_address}
                />
              </div>
            )}

            {/* Reviews */}
            <div
              className="rounded-2xl bg-white"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div
                className="flex items-center gap-2 border-b px-6 py-4"
                style={{ borderColor: "var(--primary-light)" }}
              >
                <Star size={15} style={{ color: "var(--primary)" }} />
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Patient Reviews ({doctor.total_reviews})
                </p>
              </div>

              {/* Rating distribution */}
              {(reviews?.length ?? 0) > 0 && (
                <div
                  className="flex items-center gap-6 border-b px-6 py-5"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div className="text-center">
                    <p
                      className="font-display text-5xl font-bold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {doctor.average_rating.toFixed(1)}
                    </p>
                    <div className="mt-1 flex justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s < Math.round(doctor.average_rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {doctor.total_reviews} reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingDist.map((item) => (
                      <div key={item.star} className="flex items-center gap-2">
                        <span className="w-3 text-right text-xs text-gray-400">
                          {item.star}
                        </span>
                        <Star
                          size={10}
                          className="shrink-0 fill-yellow-400 text-yellow-400"
                        />
                        <div
                          className="flex-1 overflow-hidden rounded-full"
                          style={{
                            background: "var(--primary-light)",
                            height: "6px",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.pct}%`,
                              background: "var(--primary)",
                            }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-400">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review list */}
              <div
                className="divide-y px-6"
                style={{ borderColor: "var(--primary-light)" }}
              >
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="py-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "var(--primary-light)" }}
                        >
                          <User size={13} style={{ color: "var(--primary)" }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-dark)" }}
                            >
                              {review.users?.full_name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  className={
                                    s < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                              {review.review_text}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-PK",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Quote
                      size={24}
                      className="mb-2 opacity-20"
                      style={{ color: "var(--primary)" }}
                    />
                    <p className="text-sm text-gray-400">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
