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
} from "lucide-react";

export default async function DoctorProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/doctor");
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!doctor) {
    redirect("/login/doctor");
  }

  const capitalize = (str: string | null) => {
    if (!str) return "Not set";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
            <p className="mt-1 text-gray-600">Your professional information</p>
          </div>
          <Link
            href="/doctor/profile/edit"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                {doctor.profile_image ? (
                  <Image
                    src={doctor.profile_image}
                    alt={doctor.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Dr. {doctor.full_name}
                    </h3>
                    <p className="font-medium text-blue-600">
                      {doctor.specialization || "Specialization not set"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctor.qualification || ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {(doctor.average_rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        doctor.is_verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {doctor.is_verified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {doctor.bio && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">{doctor.bio}</p>
              </div>
            )}
          </div>

          {/* Contact & Professional Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Contact & Professional Details
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">
                    {doctor.phone || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">
                    {doctor.experience
                      ? `${doctor.experience} years`
                      : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Consultation Fee</p>
                  <p className="font-medium text-gray-900">
                    {doctor.consultation_fee
                      ? `PKR ${doctor.consultation_fee}`
                      : "Not set"}
                  </p>
                </div>
              </div>
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="col-span-2 flex items-start gap-3">
                  <Globe className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Languages</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {doctor.languages.map((lang: string) => (
                        <span
                          key={lang}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinic Information */}
          {(doctor.clinic_name || doctor.clinic_address || doctor.city) && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Building2 className="h-5 w-5 text-gray-400" />
                Clinic Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {doctor.clinic_name && (
                  <div>
                    <p className="text-xs text-gray-500">Clinic Name</p>
                    <p className="font-medium text-gray-900">
                      {doctor.clinic_name}
                    </p>
                  </div>
                )}
                {doctor.city && (
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="font-medium text-gray-900">{doctor.city}</p>
                  </div>
                )}
                {doctor.clinic_address && (
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Clinic Address</p>
                      <p className="font-medium text-gray-900">
                        {doctor.clinic_address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {(doctor.pmdc_certificate || doctor.degree_document) && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-gray-400" />
                Verification Documents
              </h3>
              <div className="flex flex-wrap gap-3">
                {doctor.pmdc_certificate && (
                  <a
                    href={doctor.pmdc_certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    PMDC Certificate
                  </a>
                )}
                {doctor.degree_document && (
                  <a
                    href={doctor.degree_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    Degree Certificate
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account ID</span>
                <span className="font-mono text-gray-900">{doctor.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={
                    doctor.is_verified
                      ? "font-medium text-green-600"
                      : "font-medium text-yellow-600"
                  }
                >
                  {capitalize(
                    doctor.status ||
                      (doctor.is_verified ? "verified" : "pending")
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
