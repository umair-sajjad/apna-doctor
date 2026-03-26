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

    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Get doctor profile error:", error);
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
      specialization,
      qualification,
      experience,
      bio,
      clinicName,
      clinicAddress,
      city,
      consultationFee,
      languages,
      profilePhoto,
      pmdcCertificateUrl,
      degreeCertificateUrl,
    } = body;

    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }
    if (!specialization) {
      return NextResponse.json(
        { error: "Specialization is required" },
        { status: 400 }
      );
    }

    const parsedExperience =
      experience !== "" && experience != null ? parseInt(experience) : null;
    const parsedFee =
      consultationFee !== "" && consultationFee != null
        ? parseInt(consultationFee)
        : null;

    if (parsedExperience !== null && isNaN(parsedExperience)) {
      return NextResponse.json(
        { error: "Experience must be a valid number" },
        { status: 400 }
      );
    }
    if (parsedFee !== null && isNaN(parsedFee)) {
      return NextResponse.json(
        { error: "Consultation fee must be a valid number" },
        { status: 400 }
      );
    }

    const { data: doctor, error } = await supabase
      .from("doctors")
      .update({
        full_name: fullName,
        phone,
        specialization,
        qualification,
        experience: parseInt(experience),
        bio,
        clinic_name: clinicName,
        clinic_address: clinicAddress,
        city,
        consultation_fee: parseInt(consultationFee),
        languages,
        profile_image: profilePhoto || null,
        pmdc_certificate: pmdcCertificateUrl || null,
        degree_document: degreeCertificateUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      if (error.code === "23502") {
        return NextResponse.json(
          { error: "Please fill in all required fields" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Update doctor profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
