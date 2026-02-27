"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const userType = formData.get("userType") as "user" | "doctor";

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user" };
  }

  // Create user/doctor record in database
  if (userType === "user") {
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      phone,
      full_name: fullName,
      password_hash: "", // Supabase Auth handles this
    });

    if (dbError) {
      return { error: dbError.message };
    }
  } else {
    // For doctors, we'll create minimal record - they complete profile later
    const { error: dbError } = await supabase.from("doctors").insert({
      id: authData.user.id,
      email,
      phone,
      full_name: fullName,
      password_hash: "", // Supabase Auth handles this
      specialization: "General", // Temporary, they'll update this
      pmdc_number: "PENDING", // Temporary
      qualification: "PENDING", // Temporary
      experience: 0,
      clinic_name: "PENDING",
      clinic_address: "PENDING",
      city: "PENDING",
      consultation_fee: 0,
      gender: "male",
      languages: ["English"],
    });

    if (dbError) {
      return { error: dbError.message };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user is a doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  revalidatePath("/", "layout");

  // Use redirect after revalidatePath
  if (doctor) {
    redirect("/doctor/dashboard");
  } else {
    redirect("/dashboard");
  }
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
