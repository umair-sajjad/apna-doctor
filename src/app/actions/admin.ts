"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  return { supabase, user, isAdmin: !!admin };
}

export async function verifyDoctor(
  doctorId: string,
  approve: boolean,
  reason?: string
) {
  const { supabase, isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const { error } = await supabase
    .from("doctors")
    .update({
      is_verified: approve,
      verified_at: approve ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doctorId);

  if (error) return { error: error.message };

  revalidatePath("/admin/doctors");
  return { success: true };
}

export async function deleteDoctor(doctorId: string) {
  const { supabase, isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", doctorId);

  if (error) return { error: error.message };

  revalidatePath("/admin/doctors");
  return { success: true };
}

export async function toggleReviewVisibility(reviewId: string, currentlyVisible: boolean) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const db = getServiceClient();
  const { error } = await db
    .from("reviews")
    .update({ is_visible: !currentlyVisible })
    .eq("id", reviewId);

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const db = getServiceClient();
  const { error } = await db
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const db = getServiceClient();
  const { error } = await db
    .from("users")
    .delete()
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { error: "Forbidden" };

  const db = getServiceClient();
  const { error } = await db
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", appointmentId);

  if (error) return { error: error.message };

  revalidatePath("/admin/appointments");
  revalidatePath(`/admin/appointments/${appointmentId}`);
  return { success: true };
}
