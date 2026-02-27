import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import BookingForm from "./BookingForm";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { doctorId } = await params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/booking/${doctorId}`);
  }

  // Get doctor details
  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", doctorId)
    .single();

  if (!doctor) {
    notFound();
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">ApnaDoctor</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black">Book Appointment</h1>

        {/* Doctor Summary */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200 text-4xl">
              👨‍⚕️
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">
                Dr. {doctor.full_name}
              </h2>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="mt-1 font-semibold text-green-600">
                Consultation Fee: PKR {doctor.consultation_fee}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <BookingForm doctor={doctor} user={userData} />
      </div>
    </div>
  );
}
