import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Building2,
  DollarSign,
  Globe,
  Edit,
  Star,
  FileText,
  ShieldCheck,
  Clock,
} from "lucide-react";

function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div
      className="flex items-center gap-2 border-b px-6 py-4"
      style={{ borderColor: "var(--primary-light)" }}
    >
      <Icon size={15} style={{ color: "var(--primary)" }} />
      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--accent)" }}
      >
        {label}
      </p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-5">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "var(--primary-light)" }}
      >
        <Icon size={14} style={{ color: "var(--primary)" }} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p
          className="mt-0.5 text-sm font-semibold"
          style={{ color: "var(--text-dark)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function DoctorProfilePage() {
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

  const capitalize = (str: string | null) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />
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
                {doctor.profile_image ? (
                  <Image
                    src={doctor.profile_image}
                    alt={doctor.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: "rgba(14,165,233,0.15)" }}
                  >
                    <Stethoscope size={24} style={{ color: "var(--accent)" }} />
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
                  Dr. {doctor.full_name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {doctor.specialization || "Specialization not set"}
                  </p>
                  {doctor.is_verified ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: "rgba(5,150,105,0.2)",
                        color: "#34d399",
                      }}
                    >
                      <ShieldCheck size={10} /> Verified
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: "rgba(234,179,8,0.2)",
                        color: "#fbbf24",
                      }}
                    >
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/doctor/profile/edit"
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
          {/* Bio */}
          {doctor.bio && (
            <div
              className="rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <p
                className="mb-2 text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                About
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Rating",
                value: `${(doctor.average_rating ?? 0).toFixed(1)}`,
                icon: Star,
                color: "#d97706",
                bg: "#fef3c7",
              },
              {
                label: "Experience",
                value: doctor.experience ? `${doctor.experience} yrs` : "—",
                icon: Clock,
                color: "var(--primary)",
                bg: "var(--primary-light)",
              },
              {
                label: "Consult Fee",
                value: doctor.consultation_fee
                  ? `PKR ${doctor.consultation_fee.toLocaleString()}`
                  : "—",
                icon: DollarSign,
                color: "#059669",
                bg: "#d1fae5",
              },
              {
                label: "Reviews",
                value: String(doctor.total_reviews ?? 0),
                icon: Star,
                color: "#7c3aed",
                bg: "#ede9fe",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-2xl bg-white p-5"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div
                  className="absolute top-0 right-0 left-0 h-0.5"
                  style={{ background: item.color }}
                />
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: item.bg }}
                >
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <p
                  className="font-display text-xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Contact & professional */}
          <div
            className="overflow-hidden rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <SectionHeader icon={User} label="Contact & Professional Details" />
            <div
              className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <InfoTile
                icon={Phone}
                label="Phone Number"
                value={doctor.phone || "Not set"}
              />
              <InfoTile icon={Mail} label="Email" value={user.email ?? "—"} />
              <InfoTile
                icon={Stethoscope}
                label="Qualification"
                value={doctor.qualification || "Not set"}
              />
              <InfoTile
                icon={DollarSign}
                label="Consultation Fee"
                value={
                  doctor.consultation_fee
                    ? `PKR ${doctor.consultation_fee.toLocaleString()}`
                    : "Not set"
                }
              />
            </div>
            {doctor.languages && doctor.languages.length > 0 && (
              <div
                className="flex items-start gap-3 border-t p-5"
                style={{ borderColor: "var(--primary-light)" }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Globe size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Languages</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {doctor.languages.map((lang: string) => (
                      <span
                        key={lang}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: "var(--primary-light)",
                          color: "var(--primary)",
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clinic */}
          {(doctor.clinic_name || doctor.clinic_address || doctor.city) && (
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <SectionHeader icon={Building2} label="Clinic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {[
                  {
                    label: "Clinic Name",
                    value: doctor.clinic_name,
                    icon: Building2,
                  },
                  { label: "City", value: doctor.city, icon: MapPin },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <InfoTile
                      key={field.label}
                      icon={field.icon}
                      label={field.label}
                      value={field.value}
                    />
                  ))}
              </div>
              {doctor.clinic_address && (
                <div
                  className="flex items-start gap-3 border-t p-5"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <MapPin size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Clinic Address</p>
                    <p
                      className="mt-0.5 text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {doctor.clinic_address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {(doctor.pmdc_certificate || doctor.degree_document) && (
            <div
              className="rounded-2xl bg-white"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <SectionHeader icon={FileText} label="Verification Documents" />
              <div className="flex flex-wrap gap-3 p-6">
                {[
                  { label: "PMDC Certificate", url: doctor.pmdc_certificate },
                  { label: "Degree Certificate", url: doctor.degree_document },
                ]
                  .filter((d) => d.url)
                  .map((doc) => (
                    <a
                      key={doc.label}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        borderColor: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      <FileText size={14} /> {doc.label}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Account info */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <SectionHeader icon={ShieldCheck} label="Account Information" />
            <div
              className="divide-y px-6"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[
                {
                  label: "Account ID",
                  value: doctor.id,
                  mono: true,
                  color: "var(--text-dark)",
                },
                {
                  label: "Status",
                  value: capitalize(
                    doctor.status ||
                      (doctor.is_verified ? "verified" : "pending")
                  ),
                  mono: false,
                  color: doctor.is_verified ? "#059669" : "#d97706",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span
                    className={`text-sm font-medium ${row.mono ? "font-mono" : ""}`}
                    style={{ color: row.color }}
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
