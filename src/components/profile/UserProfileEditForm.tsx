"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";
import TagInput from "@/components/ui/TagInput";
import { Activity } from "lucide-react";
import AddressInput from "@/components/ui/AddressInput";

interface User {
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
  city: string | null;
  area: string | null;
  street: string | null;
  house_number: string | null;
  zip_code: string | null;
}

export default function UserProfileEditForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user.profile_photo || "");
  const [diseases, setDiseases] = useState<string[]>(user.diseases || []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/user/profile", {
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
          diseases: diseases,
          country: formData.get("address_country"),
          city: formData.get("address_city"),
          area: formData.get("address_area"),
          street: formData.get("address_street"),
          houseNumber: formData.get("address_houseNumber"),
          zipCode: formData.get("address_zipCode"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.push("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
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
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={user.full_name}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={user.date_of_birth || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              defaultValue={user.gender || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              name="maritalStatus"
              defaultValue={user.marital_status || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Address Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Address Information</h3>
        <AddressInput
          defaultValues={{
            country: user.country || undefined,
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

      {/* Medical Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Activity className="h-5 w-5 text-blue-600" />
          Medical Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="hasDiabetes"
                defaultChecked={user.has_diabetes}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">I have Diabetes</span>
            </label>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="hasHighBloodPressure"
                defaultChecked={user.has_high_blood_pressure}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">I have High Blood Pressure</span>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Chronic Diseases
            </label>
            <TagInput
              value={diseases}
              onChange={setDiseases}
              placeholder="Type disease name..."
              suggestions={[
                "Asthma",
                "Arthritis",
                "Cancer",
                "Heart Disease",
                "Kidney Disease",
                "Liver Disease",
                "Thyroid Disorder",
                "Epilepsy",
                "Migraine",
                "Anemia",
                "Allergies",
                "COPD",
                "Depression",
                "Anxiety",
                "Osteoporosis",
              ]}
              allowNone={true}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/profile")}
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
