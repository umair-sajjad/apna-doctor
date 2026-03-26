"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  FileText,
  User,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { verifyDoctor, deleteDoctor } from "@/app/actions/admin";

type Doctor = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  pmdc_number: string | null;
  experience: number;
  consultation_fee: number;
  is_verified: boolean;
  verified_at: string | null;
  profile_image: string | null;
  qualification: string;
  clinic_name: string;
  city: string;
  bio: string | null;
  languages: string[];
  average_rating: number;
  total_reviews: number;
  total_appointments: number;
  pmdc_certificate: string | null;
  degree_document: string | null;
  experience_certificate: string | null;
  created_at: string;
};

type Tab = "all" | "pending" | "verified";

interface Props {
  doctors: Doctor[];
}

export default function DoctorsTable({ doctors: initial }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>(initial);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Doctor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = doctors;
    if (tab === "pending") list = list.filter((d) => !d.is_verified);
    if (tab === "verified") list = list.filter((d) => d.is_verified);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          (d.pmdc_number ?? "").toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [doctors, tab, search]);

  const counts = useMemo(
    () => ({
      all: doctors.length,
      pending: doctors.filter((d) => !d.is_verified).length,
      verified: doctors.filter((d) => d.is_verified).length,
    }),
    [doctors]
  );

  function optimisticVerify(id: string, approve: boolean) {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              is_verified: approve,
              verified_at: approve ? new Date().toISOString() : null,
            }
          : d
      )
    );
  }

  function optimisticDelete(id: string) {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  }

  function handleApprove(doctor: Doctor) {
    setActionError(null);
    optimisticVerify(doctor.id, true);
    if (selectedDoctor?.id === doctor.id)
      setSelectedDoctor({ ...selectedDoctor, is_verified: true });
    startTransition(async () => {
      const res = await verifyDoctor(doctor.id, true);
      if (res.error) {
        setActionError(res.error);
        optimisticVerify(doctor.id, false); // rollback
      }
    });
  }

  function handleRejectSubmit() {
    if (!rejectTarget) return;
    setActionError(null);
    const target = rejectTarget;
    optimisticVerify(target.id, false);
    setRejectTarget(null);
    setRejectReason("");
    startTransition(async () => {
      const res = await verifyDoctor(target.id, false, rejectReason);
      if (res.error) setActionError(res.error);
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setActionError(null);
    const target = deleteTarget;
    optimisticDelete(target.id);
    setDeleteTarget(null);
    if (selectedDoctor?.id === target.id) setSelectedDoctor(null);
    startTransition(async () => {
      const res = await deleteDoctor(target.id);
      if (res.error) {
        setActionError(res.error);
        setDoctors((prev) => [...prev, target]); // rollback
      }
    });
  }

  return (
    <>
      {/* Search + Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Search */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, PMDC, specialization, city…"
              className="w-full rounded-lg border border-gray-200 py-2 pr-8 pl-9 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-4 pt-2">
          {(["all", "pending", "verified"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "all" && "All Doctors"}
              {t === "pending" && "Pending Verification"}
              {t === "verified" && "Verified"}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  t === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : t === "verified"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Specialization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  PMDC No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Exp / Fee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Joined
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    {search ? "No doctors match your search." : "No doctors found."}
                  </td>
                </tr>
              ) : (
                filtered.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* Doctor */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                          {doctor.profile_image ? (
                            <Image
                              src={doctor.profile_image}
                              alt={doctor.full_name}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            Dr. {doctor.full_name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {doctor.specialization}
                    </td>

                    {/* PMDC */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {doctor.pmdc_number ?? "—"}
                    </td>

                    {/* Exp / Fee */}
                    <td className="px-4 py-3 text-sm">
                      <span className="text-gray-700">
                        {doctor.experience} yrs
                      </span>
                      <span className="mx-1 text-gray-300">/</span>
                      <span className="font-medium text-green-600">
                        PKR {doctor.consultation_fee.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {doctor.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          <XCircle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(doctor.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* View details */}
                        <button
                          onClick={() => setSelectedDoctor(doctor)}
                          className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Approve — only for pending */}
                        {!doctor.is_verified && (
                          <button
                            onClick={() => handleApprove(doctor)}
                            disabled={isPending}
                            className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Reject — only for pending */}
                        {!doctor.is_verified && (
                          <button
                            onClick={() => setRejectTarget(doctor)}
                            disabled={isPending}
                            className="rounded p-1.5 text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Revoke — only for verified */}
                        {doctor.is_verified && (
                          <button
                            onClick={() => setRejectTarget(doctor)}
                            disabled={isPending}
                            className="rounded p-1.5 text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-50"
                            title="Revoke verification"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(doctor)}
                          disabled={isPending}
                          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{doctors.length}</strong> doctors
        </div>
      </div>

      {/* ── Doctor Detail Modal ── */}
      {selectedDoctor && (
        <Modal onClose={() => setSelectedDoctor(null)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {selectedDoctor.profile_image ? (
                  <Image
                    src={selectedDoctor.profile_image}
                    alt={selectedDoctor.full_name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dr. {selectedDoctor.full_name}
                </h2>
                <p className="text-sm text-gray-500">{selectedDoctor.email}</p>
                <div className="mt-1">
                  {selectedDoctor.is_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      <XCircle className="h-3 w-3" />
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <InfoRow label="Specialization" value={selectedDoctor.specialization} />
            <InfoRow label="Qualification" value={selectedDoctor.qualification} />
            <InfoRow label="PMDC Number" value={selectedDoctor.pmdc_number ?? "—"} mono />
            <InfoRow label="Experience" value={`${selectedDoctor.experience} years`} />
            <InfoRow
              label="Consultation Fee"
              value={`PKR ${selectedDoctor.consultation_fee.toLocaleString()}`}
            />
            <InfoRow label="Phone" value={selectedDoctor.phone} />
            <InfoRow label="Clinic" value={selectedDoctor.clinic_name} />
            <InfoRow label="City" value={selectedDoctor.city} />
            <InfoRow
              label="Rating"
              value={`${selectedDoctor.average_rating.toFixed(1)} ⭐ (${selectedDoctor.total_reviews} reviews)`}
            />
            <InfoRow
              label="Total Appointments"
              value={String(selectedDoctor.total_appointments)}
            />
            {selectedDoctor.languages?.length > 0 && (
              <InfoRow
                label="Languages"
                value={selectedDoctor.languages.join(", ")}
              />
            )}
            <InfoRow
              label="Joined"
              value={new Date(selectedDoctor.created_at).toLocaleDateString(
                "en-PK",
                { dateStyle: "long" }
              )}
            />
          </div>

          {selectedDoctor.bio && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Bio
              </p>
              <p className="text-sm text-gray-700">{selectedDoctor.bio}</p>
            </div>
          )}

          {/* Documents */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Uploaded Documents
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <DocLink
                label="PMDC Certificate"
                url={selectedDoctor.pmdc_certificate}
              />
              <DocLink
                label="Degree Document"
                url={selectedDoctor.degree_document}
              />
              <DocLink
                label="Experience Certificate"
                url={selectedDoctor.experience_certificate}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Link
              href={`/doctors/${selectedDoctor.id}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              Public Profile
            </Link>
            {!selectedDoctor.is_verified && (
              <>
                <button
                  onClick={() => {
                    setRejectTarget(selectedDoctor);
                    setSelectedDoctor(null);
                  }}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedDoctor);
                    setSelectedDoctor(null);
                  }}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              </>
            )}
            {selectedDoctor.is_verified && (
              <button
                onClick={() => {
                  setRejectTarget(selectedDoctor);
                  setSelectedDoctor(null);
                }}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Revoke Verification
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Reject / Revoke Modal ── */}
      {rejectTarget && (
        <Modal onClose={() => { setRejectTarget(null); setRejectReason(""); }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <XCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {rejectTarget.is_verified
                  ? "Revoke Verification"
                  : "Reject Application"}
              </h2>
              <p className="text-sm text-gray-500">
                Dr. {rejectTarget.full_name}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Reason{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. PMDC number could not be verified, documents unclear..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => { setRejectTarget(null); setRejectReason(""); }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={isPending}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {rejectTarget.is_verified ? "Revoke" : "Reject"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Delete Doctor</h2>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-700">
            Are you sure you want to permanently delete{" "}
            <strong>Dr. {deleteTarget.full_name}</strong>? All associated data
            will be removed.
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ── Helpers ── */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-gray-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 px-3 py-2.5 text-xs text-gray-400">
        <FileText className="h-4 w-4 shrink-0" />
        <span>{label}</span>
        <span className="ml-auto text-gray-300">Not uploaded</span>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
