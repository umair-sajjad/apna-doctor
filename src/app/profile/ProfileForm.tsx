"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
}

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        <h3 className="text-lg font-semibold text-black">
          Personal Information
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={user.full_name}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-black"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={user.date_of_birth || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-black">
              Gender
            </label>
            <select
              name="gender"
              defaultValue={user.gender || ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-black"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black">
          Account Information
        </h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Account ID:</span>
            <span className="font-mono text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
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
