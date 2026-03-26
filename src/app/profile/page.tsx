import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  Edit,
  ShieldCheck,
} from "lucide-react";
import UserNavbar from "@/components/shared/UserNavbar";

export default async function UserProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  if (doctor) redirect("/doctor/profile");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!userData) redirect("/dashboard");

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalize = (str: string | null) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header banner */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-8"
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
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-2xl"
                style={{ border: "2px solid rgba(14,165,233,0.3)" }}
              >
                {userData.profile_photo ? (
                  <Image
                    src={userData.profile_photo}
                    alt={userData.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: "rgba(14,165,233,0.15)" }}
                  >
                    <User size={24} style={{ color: "var(--accent)" }} />
                  </div>
                )}
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  My Profile
                </p>
                <h1 className="font-display text-2xl font-bold text-white">
                  {userData.full_name}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {userData.email}
                </p>
              </div>
            </div>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Edit size={14} /> Edit Profile
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          {/* Personal info */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <User size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Personal Information
              </p>
            </div>
            <div
              className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
                {
                  icon: Phone,
                  label: "Phone Number",
                  value: userData.phone || "Not set",
                },
                { icon: Mail, label: "Email", value: userData.email },
                {
                  icon: Calendar,
                  label: "Date of Birth",
                  value: formatDate(userData.date_of_birth),
                },
                {
                  icon: User,
                  label: "Gender",
                  value: capitalize(userData.gender),
                },
                {
                  icon: User,
                  label: "Marital Status",
                  value: capitalize(userData.marital_status),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-5"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <item.icon size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p
                      className="mt-0.5 text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          {(userData.country || userData.city || userData.street) && (
            <div
              className="rounded-2xl bg-white"
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
                  Address
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-3">
                {[
                  { label: "House No.", value: userData.house_number },
                  { label: "Street", value: userData.street },
                  { label: "Area", value: userData.area },
                  { label: "City", value: userData.city },
                  { label: "Country", value: userData.country },
                  { label: "ZIP Code", value: userData.zip_code },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-gray-400">{field.label}</p>
                      <p
                        className="mt-0.5 text-sm font-semibold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Medical info */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <Activity size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Medical Information
              </p>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "Diabetes", value: userData.has_diabetes },
                  {
                    label: "High Blood Pressure",
                    value: userData.has_high_blood_pressure,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      background: "var(--bg-soft)",
                      border: "1px solid var(--primary-light)",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={
                        item.value
                          ? { background: "#fee2e2", color: "#dc2626" }
                          : { background: "#d1fae5", color: "#059669" }
                      }
                    >
                      {item.value ? "Yes" : "No"}
                    </span>
                  </div>
                ))}
              </div>

              {userData.diseases && userData.diseases.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-gray-400">Chronic Diseases</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.diseases.map((disease: string) => (
                      <span
                        key={disease}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: "#fff7ed",
                          color: "#ea580c",
                          border: "1px solid #fed7aa",
                        }}
                      >
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account info */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <ShieldCheck size={15} style={{ color: "var(--primary)" }} />
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Account Information
              </p>
            </div>
            <div
              className="divide-y px-6"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
                { label: "Account ID", value: userData.id, mono: true },
                { label: "Email", value: userData.email },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span
                    className={`text-sm font-medium ${row.mono ? "font-mono" : ""}`}
                    style={{ color: "var(--text-dark)" }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
