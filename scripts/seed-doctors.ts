import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key - get from Supabase dashboard
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables!");
  console.log("Make sure you have SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDoctors() {
  const doctors = [
    {
      id: "doc-" + Math.random().toString(36).substr(2, 9),
      email: "dr.ahmed@example.com",
      phone: "03001234567",
      password_hash: "dummy",
      full_name: "Ahmed Khan",
      specialization: "General Physician",
      pmdc_number: "12345-A",
      qualification: "MBBS, FCPS",
      experience: 10,
      bio: "Experienced general physician with 10 years of practice",
      clinic_name: "City Medical Center",
      clinic_address: "Main Boulevard, Gulberg III, Lahore",
      city: "Lahore",
      consultation_fee: 2000,
      gender: "male",
      languages: ["English", "Urdu"],
      is_verified: true,
      average_rating: 4.5,
      total_reviews: 120,
    },
    {
      id: "doc-" + Math.random().toString(36).substr(2, 9),
      email: "dr.fatima@example.com",
      phone: "03009876543",
      password_hash: "dummy",
      full_name: "Fatima Malik",
      specialization: "Dermatologist",
      pmdc_number: "67890-B",
      qualification: "MBBS, MCPS (Dermatology)",
      experience: 8,
      bio: "Specialist in skin care and cosmetic dermatology",
      clinic_name: "Skin Care Clinic",
      clinic_address: "DHA Phase 5, Lahore",
      city: "Lahore",
      consultation_fee: 2500,
      gender: "female",
      languages: ["English", "Urdu"],
      is_verified: true,
      average_rating: 4.8,
      total_reviews: 95,
    },
    {
      id: "doc-" + Math.random().toString(36).substr(2, 9),
      email: "dr.ali@example.com",
      phone: "03201234567",
      password_hash: "dummy",
      full_name: "Ali Raza",
      specialization: "Cardiologist",
      pmdc_number: "11111-C",
      qualification: "MBBS, FCPS (Cardiology)",
      experience: 15,
      bio: "Senior cardiologist specializing in heart disease prevention",
      clinic_name: "Heart Care Center",
      clinic_address: "Jail Road, Lahore",
      city: "Lahore",
      consultation_fee: 3500,
      gender: "male",
      languages: ["English", "Urdu", "Punjabi"],
      is_verified: true,
      average_rating: 4.7,
      total_reviews: 200,
    },
    {
      id: "doc-" + Math.random().toString(36).substr(2, 9),
      email: "dr.sara@example.com",
      phone: "03119876543",
      password_hash: "dummy",
      full_name: "Sara Ahmed",
      specialization: "Pediatrician",
      pmdc_number: "22222-D",
      qualification: "MBBS, DCH",
      experience: 6,
      bio: "Child health specialist with focus on preventive care",
      clinic_name: "Kids Health Clinic",
      clinic_address: "Model Town, Lahore",
      city: "Lahore",
      consultation_fee: 1800,
      gender: "female",
      languages: ["English", "Urdu"],
      is_verified: true,
      average_rating: 4.9,
      total_reviews: 150,
    },
    {
      id: "doc-" + Math.random().toString(36).substr(2, 9),
      email: "dr.hassan@example.com",
      phone: "03331234567",
      password_hash: "dummy",
      full_name: "Hassan Mahmood",
      specialization: "Dentist",
      pmdc_number: "33333-E",
      qualification: "BDS, FCPS",
      experience: 12,
      bio: "Expert in dental care and cosmetic dentistry",
      clinic_name: "Smile Dental Clinic",
      clinic_address: "MM Alam Road, Lahore",
      city: "Lahore",
      consultation_fee: 2200,
      gender: "male",
      languages: ["English", "Urdu"],
      is_verified: true,
      average_rating: 4.6,
      total_reviews: 180,
    },
  ];

  console.log("Seeding doctors...\n");

  for (const doctor of doctors) {
    const { error } = await supabase.from("doctors").insert(doctor);

    if (error) {
      console.error(`✗ Failed to insert ${doctor.full_name}:`, error.message);
    } else {
      console.log(`✓ Added ${doctor.full_name} - ${doctor.specialization}`);
    }
  }

  console.log("\nDone!");
}

seedDoctors();
