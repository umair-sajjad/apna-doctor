"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";
import TagInput from "@/components/ui/TagInput";

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

const LANGUAGE_OPTIONS = [
  "Urdu",
  "English",
  "Punjabi",
  "Sindhi",
  "Pashto",
  "Balochi",
  "Saraiki",
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
          languages,
          profilePhoto: profilePhotoUrl,
          pmdcCertificateUrl: pmdcUrl,
          degreeCertificateUrl: degreeUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.push("/doctor/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
        <div className="mt-4">
          <FileUpload
            label="Your Photo"
            type="profile_photo"
            currentUrl={profilePhotoUrl}
            onUploadComplete={(url) => setProfilePhotoUrl(url)}
            accept="image/*"
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Personal Information
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={doctor.full_name}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={doctor.phone}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Professional Information
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specialization
            </label>
            <select
              name="specialization"
              defaultValue={doctor.specialization || ""}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
            <label className="block text-sm font-medium text-gray-700">
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              defaultValue={doctor.qualification || ""}
              placeholder="e.g. MBBS, FCPS"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="number"
              name="experience"
              defaultValue={doctor.experience || ""}
              min="0"
              max="60"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Consultation Fee (PKR)
            </label>
            <input
              type="number"
              name="consultationFee"
              defaultValue={doctor.consultation_fee || ""}
              min="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={doctor.bio || ""}
              rows={4}
              placeholder="Tell patients about your experience and expertise..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Languages Spoken
            </label>
            <TagInput
              value={languages}
              onChange={setLanguages}
              placeholder="Add language..."
              suggestions={LANGUAGE_OPTIONS}
              allowNone={false}
            />
          </div>
        </div>
      </div>

      {/* Clinic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Clinic Information
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clinic Name
            </label>
            <input
              type="text"
              name="clinicName"
              defaultValue={doctor.clinic_name || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              defaultValue={doctor.city || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Clinic Address
            </label>
            <input
              type="text"
              name="clinicAddress"
              defaultValue={doctor.clinic_address || ""}
              placeholder="Full clinic address"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Verification Documents
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload your PMDC certificate and degree to get verified.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <FileUpload
              label="PMDC Certificate"
              type="pmdc_certificate"
              currentUrl={pmdcUrl}
              onUploadComplete={(url) => setPmdcUrl(url)}
              accept=".pdf,image/*"
            />
          </div>
          <div>
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
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/doctor/profile")}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
