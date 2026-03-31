"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function deleteAuthUser(userId: string) {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await serviceClient.auth.admin.deleteUser(userId);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const userType = formData.get("userType") as string;
  const maritalStatus = formData.get("maritalStatus") as string;
  const gender = formData.get("gender") as string;

  const hasDiabetes = formData.get("hasDiabetes") === "on";
  const hasHighBloodPressure = formData.get("hasHighBloodPressure") === "on";
  const diseases = formData.get("diseases")
    ? JSON.parse(formData.get("diseases") as string)
    : [];

  const pmdcNumber = formData.get("pmdcNumber") as string;

  const phoneRegex = /^03[0-9]{2}-[0-9]{7}$/;
  if (!phoneRegex.test(phone)) {
    return { error: "Invalid phone number format. Use 03XX-XXXXXXX" };
  }

  if (userType === "doctor" && !gender) {
    return { error: "Please select a gender" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: "An account with this email already exists" };
  }

  if (userType === "user") {
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      phone,
      full_name: fullName,
      marital_status: maritalStatus || null,
      has_diabetes: hasDiabetes,
      has_high_blood_pressure: hasHighBloodPressure,
      diseases: diseases.length > 0 ? diseases : [],
      location_permission_granted: false,
    });

    if (dbError) {
      await deleteAuthUser(authData.user.id);
      console.error("User insert error:", dbError);
      if (dbError.code === "23505") {
        if (dbError.message.includes("phone")) {
          return { error: "An account with this phone number already exists" };
        }
        if (dbError.message.includes("email")) {
          return { error: "An account with this email already exists" };
        }
      }
      return { error: "Failed to create account. Please try again." };
    }

    redirect("/dashboard");
  }

  if (userType === "doctor") {
    const { error: dbError } = await supabase.from("doctors").insert({
      id: authData.user.id,
      email,
      phone,
      full_name: fullName,
      pmdc_number: pmdcNumber || null,
      gender,
      specialization: "General Physician",
      qualification: "MBBS",
      experience: 0,
      clinic_name: "To be updated",
      city: "Lahore",
      consultation_fee: 1000,
      country: "PK",
      languages: ["Urdu", "English"],
    });

    if (dbError) {
      await deleteAuthUser(authData.user.id);
      console.error("Doctor insert error:", dbError);
      if (dbError.code === "23505") {
        if (dbError.message.includes("phone")) {
          return { error: "An account with this phone number already exists" };
        }
        if (dbError.message.includes("email")) {
          return { error: "An account with this email already exists" };
        }
        if (dbError.message.includes("pmdc")) {
          return { error: "This PMDC number is already registered" };
        }
      }
      return { error: "Failed to create account. Please try again." };
    }

    redirect("/doctor/dashboard");
  }

  return { error: "Invalid account type" };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const userType = formData.get("userType") as "user" | "doctor";
  const next = (formData.get("next") as string | null)?.trim() || null;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (userType === "doctor") {
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", authData.user.id)
      .single();

    if (!doctor) {
      await supabase.auth.signOut();
      return { error: "No doctor account found with this email" };
    }

    revalidatePath("/", "layout");
    redirect("/doctor/dashboard");
  } else {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .single();

    if (!user) {
      await supabase.auth.signOut();
      return { error: "No user account found with this email" };
    }

    revalidatePath("/", "layout");
    // Redirect to the requested page if provided, otherwise default dashboard
    redirect(next && next.startsWith("/") ? next : "/dashboard");
  }
}

export async function signInAdmin(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid credentials" };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("*")
    .eq("id", authData.user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    return { error: "Unauthorized. Admin access required." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
