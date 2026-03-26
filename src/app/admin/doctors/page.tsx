import { createClient } from "@/lib/supabase/server";
import DoctorsTable from "@/components/admin/DoctorsTable";
import { CheckCircle, Users, Clock, Star } from "lucide-react";

export default async function AdminDoctorsPage() {
  const supabase = await createClient();

  const { data: doctors, count } = await supabase
    .from("doctors")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const all = doctors ?? [];
  const verifiedCount = all.filter((d) => d.is_verified).length;
  const pendingCount = all.filter((d) => !d.is_verified).length;
  const avgRating =
    all.length > 0
      ? (all.reduce((s, d) => s + (d.average_rating ?? 0), 0) / all.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
        <p className="mt-1 text-gray-600">
          Review applications and manage doctor verifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-50"
          label="Total Doctors"
          value={count ?? 0}
          color="text-blue-700"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          bg="bg-green-50"
          label="Verified"
          value={verifiedCount}
          color="text-green-700"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          bg="bg-yellow-50"
          label="Pending Review"
          value={pendingCount}
          color="text-yellow-700"
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-purple-600" />}
          bg="bg-purple-50"
          label="Avg Rating"
          value={avgRating}
          color="text-purple-700"
        />
      </div>

      {/* Table */}
      <DoctorsTable doctors={all} />
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
