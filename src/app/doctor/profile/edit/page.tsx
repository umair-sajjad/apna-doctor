import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DoctorProfileEditForm from "@/components/profile/DoctorProfileEditForm";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import { ArrowLeft } from "lucide-react";

export default async function DoctorProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/doctor");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/login/doctor");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-7"
          style={{ background: "var(--text-dark)" }}
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
            className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                Account
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold text-white">
                Edit Profile
              </h1>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Update your professional information
              </p>
            </div>
            <Link
              href="/doctor/profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <ArrowLeft size={14} /> Back to Profile
            </Link>
          </div>
        </div>

        <DoctorProfileEditForm doctor={doctor} />
      </div>
    </div>
  );
}
