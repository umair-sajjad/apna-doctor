"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";
import TagInput from "@/components/ui/TagInput";
import AddressInput from "@/components/ui/AddressInput";
import {
  Activity,
  User,
  MapPin,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface UserData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  profile_photo: string | null;
  marital_status: string | null;
  has_diabetes: boolean;
  has_high_blood_pressure: boolean;
  diseases: string[];
  country: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  street: string | null;
  house_number: string | null;
  zip_code: string | null;
}

const SECTION_CLASS = "rounded-2xl bg-white";
const SECTION_STYLE = { border: "1px solid var(--primary-light)" };

const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide";
const INPUT_CLASS =
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

export default function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    user.profile_photo || ""
  );
  const [diseases, setDiseases] = useState<string[]>(user.diseases || []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          dateOfBirth: formData.get("dateOfBirth"),
          gender: formData.get("gender"),
          profilePhoto: profilePhotoUrl,
          maritalStatus: formData.get("maritalStatus"),
          hasDiabetes: formData.get("hasDiabetes") === "on",
          hasHighBloodPressure: formData.get("hasHighBloodPressure") === "on",
          diseases,
          country: formData.get("address_country"),
          state: formData.get("address_state"),
          city: formData.get("address_city"),
          area: formData.get("address_area"),
          street: formData.get("address_street"),
          houseNumber: formData.get("address_houseNumber"),
          zipCode: formData.get("address_zipCode"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Profile photo */}
      <div className={SECTION_CLASS} style={SECTION_STYLE}>
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

      {/* Personal information */}
      <div className={SECTION_CLASS} style={SECTION_STYLE}>
        <SectionHeader icon={User} label="Personal Information" />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={user.full_name}
              required
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone}
              required
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${INPUT_CLASS} cursor-not-allowed opacity-60`}
              style={{ ...INPUT_STYLE, background: "var(--bg-soft)" }}
            />
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={user.date_of_birth || ""}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Gender
            </label>
            <select
              name="gender"
              defaultValue={user.gender || ""}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Marital Status
            </label>
            <select
              name="maritalStatus"
              defaultValue={user.marital_status || ""}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            >
              <option value="">Prefer not to say</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={SECTION_CLASS} style={SECTION_STYLE}>
        <SectionHeader icon={MapPin} label="Address Information" />
        <div className="p-6">
          <AddressInput
            defaultValues={{
              country: user.country || undefined,
              state: user.state || undefined,
              city: user.city || undefined,
              area: user.area || undefined,
              street: user.street || undefined,
              houseNumber: user.house_number || undefined,
              zipCode: user.zip_code || undefined,
            }}
            namePrefix="address"
            required={false}
          />
        </div>
      </div>

      {/* Medical information */}
      <div className={SECTION_CLASS} style={SECTION_STYLE}>
        <SectionHeader icon={Activity} label="Medical Information" />
        <div className="space-y-5 p-6">
          {/* Checkboxes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                name: "hasDiabetes",
                label: "I have Diabetes",
                checked: user.has_diabetes,
              },
              {
                name: "hasHighBloodPressure",
                label: "I have High Blood Pressure",
                checked: user.has_high_blood_pressure,
              },
            ].map((item) => (
              <label
                key={item.name}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-gray-50"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <input
                  type="checkbox"
                  name={item.name}
                  defaultChecked={item.checked}
                  className="rounded border-gray-300"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-dark)" }}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Diseases tag input */}
          <div>
            <label
              className={LABEL_CLASS}
              style={{ color: "var(--text-dark)" }}
            >
              Chronic Diseases
            </label>
            <TagInput
              value={diseases}
              onChange={setDiseases}
              placeholder="Type disease name…"
              allowNone={true}
            />
          </div>
        </div>
      </div>

      {/* Account info (read-only) */}
      <div className={SECTION_CLASS} style={SECTION_STYLE}>
        <SectionHeader icon={ShieldCheck} label="Account Information" />
        <div
          className="divide-y px-6"
          style={{ borderColor: "var(--primary-light)" }}
        >
          {[
            { label: "Account ID", value: user.id, mono: true },
            { label: "Email", value: user.email, mono: false },
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
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
