"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Doctor {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  bio: string | null;
  clinic_name: string;
  clinic_address: string;
  city: string;
  consultation_fee: number;
  languages: string[];
}

interface Specialization {
  name: string;
}

export default function ProfileForm({
  doctor,
  specializations,
}: {
  doctor: Doctor;
  specializations: Specialization[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    doctor.languages || []
  );

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/doctor/profile", {
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
          languages: selectedLanguages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-black">
      {/* Personal Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={doctor.full_name}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={doctor.phone}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={doctor.email}
              disabled
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Specialization</label>
            <select
              name="specialization"
              defaultValue={doctor.specialization}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {specializations.map((spec) => (
                <option key={spec.name} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Qualification</label>
            <input
              type="text"
              name="qualification"
              defaultValue={doctor.qualification}
              placeholder="MBBS, FCPS"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Experience (years)
            </label>
            <input
              type="number"
              name="experience"
              defaultValue={doctor.experience}
              min="0"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Consultation Fee (PKR)
            </label>
            <input
              type="number"
              name="consultationFee"
              defaultValue={doctor.consultation_fee}
              min="0"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={doctor.bio || ""}
              placeholder="Tell patients about yourself and your expertise..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Clinic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Clinic Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Clinic Name</label>
            <input
              type="text"
              name="clinicName"
              defaultValue={doctor.clinic_name}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              name="city"
              defaultValue={doctor.city}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Multan">Multan</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Clinic Address</label>
            <input
              type="text"
              name="clinicAddress"
              defaultValue={doctor.clinic_address}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Languages Spoken</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {["English", "Urdu", "Punjabi", "Sindhi", "Pashto"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedLanguages.includes(lang)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
