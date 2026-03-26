import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'user' or 'doctor'
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Check if this is a new user (first time login with Google)
      if (type === "doctor") {
        const { data: existingDoctor } = await supabase
          .from("doctors")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingDoctor) {
          // Create new doctor record
          await supabase.from("doctors").insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata.full_name ||
              user.user_metadata.name ||
              user.email!.split("@")[0],
            phone: user.user_metadata.phone || "",
            password_hash: "",
            pmdc_number: `GOOGLE-${user.id.slice(0, 8)}`,
            specialization: "General",
            qualification: "MBBS",
            experience: 0,
            clinic_name: "Not Set",
            clinic_address: "Not Set",
            city: "Lahore",
            consultation_fee: 0,
            gender: "male",
            languages: ["English"],
          });
        }

        return NextResponse.redirect(`${origin}/doctor/dashboard`);
      } else {
        // User type
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // Create new user record
          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata.full_name ||
              user.user_metadata.name ||
              user.email!.split("@")[0],
            phone: user.user_metadata.phone || "",
            password_hash: "",
          });
        }

        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // Auth error - redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
