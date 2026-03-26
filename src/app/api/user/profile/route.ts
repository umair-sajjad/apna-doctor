import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      profilePhoto,
      maritalStatus,
      hasDiabetes,
      hasHighBloodPressure,
      diseases,
      // Address fields
      country,
      city,
      area,
      street,
      houseNumber,
      zipCode,
    } = body;

    // Update user profile
    const { data: userData, error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        profile_photo: profilePhoto || null,
        marital_status: maritalStatus || null,
        has_diabetes: hasDiabetes || false,
        has_high_blood_pressure: hasHighBloodPressure || false,
        diseases: diseases || [],
        // Address fields
        country: country || null,
        city: city || null,
        area: area || null,
        street: street || null,
        house_number: houseNumber || null,
        zip_code: zipCode || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
