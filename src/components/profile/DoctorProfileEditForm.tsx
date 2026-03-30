"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";
import TagInput from "@/components/ui/TagInput";
import AddressInput from "@/components/ui/AddressInput";
import {
  User,
  Phone,
  Stethoscope,
  DollarSign,
  Globe,
  Building2,
  MapPin,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Urologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Oncologist",
  "Nephrologist",
  "Rheumatologist",
  "Radiologist",
  "Anesthesiologist",
  "Dentist",
];

interface Doctor {
  id: string;
  full_name: string;
  phone: string;
  specialization: string | null;
  qualification: string | null;
  experience: number | null;
  bio: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  city: string | null;
  consultation_fee: number | null;
  languages: string[] | null;
  profile_image: string | null;
  pmdc_certificate: string | null;
  degree_document: string | null;
}

const CARD = "overflow-hidden rounded-2xl bg-white";
const CARD_STYLE = { border: "1px solid var(--primary-light)" };
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wide";
const LABEL_STYLE = { color: "var(--text-dark)" };
const INPUT =
  "w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none";
const INPUT_STYLE = {
  borderColor: "var(--primary-light)",
  color: "var(--text-dark)",
};

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

export default function DoctorProfileEditForm({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    doctor.profile_image || ""
  );
  const [pmdcUrl, setPmdcUrl] = useState(doctor.pmdc_certificate || "");
  const [degreeUrl, setDegreeUrl] = useState(doctor.degree_document || "");
  const [languages, setLanguages] = useState<string[]>(doctor.languages || []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          specialization: formData.get("specialization"),
          qualification: formData.get("qualification"),
          experience: formData.get("experience"),
          bio: formData.get("bio"),
          clinicName: formData.get("clinicName"),
          clinicAddress: formData.get("clinicAddress"),
          city: formData.get("city"),
          consultationFee: formData.get("consultationFee"),
          languages,
          profilePhoto: profilePhotoUrl,
          pmdcCertificateUrl: pmdcUrl,
          degreeCertificateUrl: degreeUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast.success("Profile updated successfully");
      router.push("/doctor/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Profile photo */}
      <div className={CARD} style={CARD_STYLE}>
        <SectionHeader icon={ImageIcon} label="Profile Photo" />
        <div className="p-6">
          <FileUpload
            label="Your Photo"
            type="profile_photo"
            currentUrl={profilePhotoUrl}
            onUploadComplete={(url) => setProfilePhotoUrl(url)}
            accept="image/*"
          />
        </div>
      </div>

      {/* Personal */}
      <div className={CARD} style={CARD_STYLE}>
        <SectionHeader icon={User} label="Personal Information" />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={doctor.full_name}
              required
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={doctor.phone}
              required
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className={CARD} style={CARD_STYLE}>
        <SectionHeader icon={Stethoscope} label="Professional Information" />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Specialization
            </label>
            <select
              name="specialization"
              defaultValue={doctor.specialization || ""}
              required
              className={INPUT}
              style={INPUT_STYLE}
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              defaultValue={doctor.qualification || ""}
              placeholder="e.g. MBBS, FCPS"
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Years of Experience
            </label>
            <input
              type="number"
              name="experience"
              defaultValue={doctor.experience || ""}
              min="0"
              max="60"
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Consultation Fee (PKR)
            </label>
            <input
              type="number"
              name="consultationFee"
              defaultValue={doctor.consultation_fee || ""}
              min="0"
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} style={LABEL_STYLE}>
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={doctor.bio || ""}
              rows={4}
              placeholder="Tell patients about your experience and expertise…"
              className={`${INPUT} resize-none`}
              style={{ ...INPUT_STYLE, background: "var(--bg-soft)" }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={`${LABEL} mb-2`} style={LABEL_STYLE}>
              Languages Spoken
            </label>
            <TagInput
              value={languages}
              onChange={setLanguages}
              placeholder="Add language…"
              allowNone={false}
            />
          </div>
        </div>
      </div>

      {/* Clinic */}
      <div className={CARD} style={CARD_STYLE}>
        <SectionHeader icon={Building2} label="Clinic Information" />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Clinic Name
            </label>
            <input
              type="text"
              name="clinicName"
              defaultValue={doctor.clinic_name || ""}
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              City
            </label>
            <input
              type="text"
              name="city"
              defaultValue={doctor.city || ""}
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} style={LABEL_STYLE}>
              Clinic Address
            </label>
            <input
              type="text"
              name="clinicAddress"
              defaultValue={doctor.clinic_address || ""}
              placeholder="Full clinic address"
              className={INPUT}
              style={INPUT_STYLE}
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className={CARD} style={CARD_STYLE}>
        <SectionHeader icon={FileText} label="Verification Documents" />
        <div className="p-6">
          <p className="mb-5 text-xs text-gray-400">
            Upload your PMDC certificate and degree to get verified.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FileUpload
              label="PMDC Certificate"
              type="pmdc_certificate"
              currentUrl={pmdcUrl}
              onUploadComplete={(url) => setPmdcUrl(url)}
              accept=".pdf,image/*"
            />
            <FileUpload
              label="Degree Certificate"
              type="degree_certificate"
              currentUrl={degreeUrl}
              onUploadComplete={(url) => setDegreeUrl(url)}
              accept=".pdf,image/*"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.push("/doctor/profile")}
          className="rounded-xl border px-6 py-3 text-sm font-semibold transition-all hover:bg-gray-50"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
