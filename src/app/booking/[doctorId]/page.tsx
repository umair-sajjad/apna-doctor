import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BookingForm from "./BookingForm";
import Logo from "@/components/shared/logo";
import { ArrowLeft, Star, Stethoscope, Clock, MapPin } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const supabase = await createClient();
  const { data: doctor } = await supabase
    .from("doctors")
    .select("full_name, specialization")
    .eq("id", doctorId)
    .single();
  if (!doctor) return { title: "Book Appointment - ApnaDoctor" };
  return {
    title: `Book Dr. ${doctor.full_name} - ${doctor.specialization} - ApnaDoctor`,
    description: `Book an appointment with Dr. ${doctor.full_name}, a verified ${doctor.specialization} in Pakistan.`,
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/user");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", doctorId)
    .eq("is_verified", true)
    .single();
  if (!doctor) notFound();

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .single();

  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("day_of_week, start_time, end_time, slot_duration")
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .order("day_of_week");

  const today = new Date().toISOString().split("T")[0];
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: bookedSlots } = await supabase
    .from("appointments")
    .select("appointment_date, appointment_time")
    .eq("doctor_id", doctorId)
    .gte("appointment_date", today)
    .lte("appointment_date", until)
    .in("status", ["pending", "confirmed"]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Minimal header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo size="sm" />
          <Link
            href={`/doctors/${doctorId}`}
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p
            className="mb-1 text-sm font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            Appointment Booking
          </p>
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Book Appointment
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar — dark doctor card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ background: "var(--text-dark)" }}
              >
                {/* Dot pattern */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {/* Glow */}
                <div
                  className="pointer-events-none absolute top-0 right-0 h-48 w-48 opacity-10 blur-3xl"
                  style={{ background: "var(--accent)" }}
                />

                <div className="relative z-10 p-6">
                  {/* Avatar */}
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div
                      className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(14,165,233,0.15)",
                        border: "1px solid rgba(14,165,233,0.2)",
                      }}
                    >
                      <Stethoscope
                        size={32}
                        style={{ color: "var(--accent)" }}
                      />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Dr. {doctor.full_name}
                    </h3>
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
                  </div>

                  {/* Stats */}
                  <div
                    className="mb-5 grid grid-cols-2 gap-3 rounded-xl p-4"
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
                        className="mt-0.5 text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Rating
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
                        className="mt-0.5 text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Experience
                      </p>
                    </div>
                  </div>

                  {/* Clinic */}
                  <div
                    className="mb-5 flex items-start gap-3 rounded-xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <MapPin
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {doctor.clinic_name}
                      </p>
                      <p
                        className="mt-0.5 text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {doctor.clinic_address}
                      </p>
                    </div>
                  </div>

                  {/* Fee */}
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Consultation Fee
                    </p>
                    <p
                      className="font-display mt-1 text-2xl font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      PKR {doctor.consultation_fee.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="lg:col-span-2">
            <BookingForm
              doctor={doctor}
              availability={availability ?? []}
              bookedSlots={bookedSlots ?? []}
              userProfile={userProfile ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
