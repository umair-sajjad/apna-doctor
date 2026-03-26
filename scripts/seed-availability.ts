import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

type AvailabilityPattern = {
  days: number[];
  start_time: string;
  end_time: string;
  slot_duration: number;
};

// Different schedule patterns — realistic for Pakistani clinic context
const patterns: Record<string, AvailabilityPattern[]> = {
  // Mon-Sat morning + evening split (General Physician, Pediatrician, Dermatologist)
  full_week_split: [
    {
      days: [1, 2, 3, 4, 6],
      start_time: "09:00",
      end_time: "13:00",
      slot_duration: 20,
    },
    {
      days: [1, 2, 3, 4, 6],
      start_time: "17:00",
      end_time: "21:00",
      slot_duration: 20,
    },
    { days: [5], start_time: "09:00", end_time: "12:00", slot_duration: 20 }, // Friday short
  ],

  // Mon-Thu + Sat (Cardiologist, Neurologist, Gastroenterologist)
  specialist_weekdays: [
    {
      days: [1, 2, 3, 4],
      start_time: "10:00",
      end_time: "14:00",
      slot_duration: 30,
    },
    { days: [6], start_time: "10:00", end_time: "13:00", slot_duration: 30 },
  ],

  // Alternate days (Surgeon types — Orthopedic, ENT, Gynecologist)
  alternate_days: [
    {
      days: [1, 3, 6],
      start_time: "09:00",
      end_time: "13:00",
      slot_duration: 30,
    },
    { days: [2, 4], start_time: "15:00", end_time: "19:00", slot_duration: 30 },
  ],

  // Evening only Mon-Sat (Psychiatrist, part-time specialists)
  evening_only: [
    {
      days: [1, 2, 3, 4, 6],
      start_time: "18:00",
      end_time: "21:00",
      slot_duration: 45,
    },
  ],

  // Morning heavy Mon-Fri (Dentist)
  dentist: [
    {
      days: [1, 2, 3, 4, 5],
      start_time: "10:00",
      end_time: "14:00",
      slot_duration: 30,
    },
    { days: [6], start_time: "10:00", end_time: "13:00", slot_duration: 30 },
  ],

  // Senior consultants — fewer days, longer slots
  senior_consultant: [
    {
      days: [1, 3, 6],
      start_time: "11:00",
      end_time: "14:00",
      slot_duration: 30,
    },
    { days: [2, 4], start_time: "17:00", end_time: "20:00", slot_duration: 30 },
  ],
};

// Map each doctor email to a pattern
const doctorPatterns: Record<string, keyof typeof patterns> = {
  // Cardiologists
  "dr.ahmad.raza@apnadoctor.pk": "senior_consultant",
  "dr.sana.mirza@apnadoctor.pk": "specialist_weekdays",
  "dr.tariq.mahmood@apnadoctor.pk": "senior_consultant",
  "dr.nadia.hussain@apnadoctor.pk": "specialist_weekdays",
  "dr.imran.sheikh@apnadoctor.pk": "specialist_weekdays",

  // Dentists
  "dr.ayesha.qureshi@apnadoctor.pk": "dentist",
  "dr.hassan.baig@apnadoctor.pk": "dentist",
  "dr.farah.siddiqui@apnadoctor.pk": "dentist",
  "dr.usman.farooq@apnadoctor.pk": "dentist",
  "dr.zainab.malik@apnadoctor.pk": "dentist",

  // Dermatologists
  "dr.rabia.anwar@apnadoctor.pk": "full_week_split",
  "dr.bilal.chaudhry@apnadoctor.pk": "full_week_split",
  "dr.hina.rashid@apnadoctor.pk": "specialist_weekdays",
  "dr.kamran.yousuf@apnadoctor.pk": "full_week_split",
  "dr.mariam.tahir@apnadoctor.pk": "senior_consultant",

  // ENT
  "dr.salman.akhtar@apnadoctor.pk": "alternate_days",
  "dr.amna.zafar@apnadoctor.pk": "specialist_weekdays",
  "dr.faisal.hameed@apnadoctor.pk": "senior_consultant",
  "dr.sobia.khalid@apnadoctor.pk": "specialist_weekdays",
  "dr.omer.farhan@apnadoctor.pk": "alternate_days",

  // Gastroenterologists
  "dr.arif.mehmood@apnadoctor.pk": "senior_consultant",
  "dr.saima.pervez@apnadoctor.pk": "specialist_weekdays",
  "dr.junaid.hassan@apnadoctor.pk": "full_week_split",
  "dr.uzma.rafiq@apnadoctor.pk": "senior_consultant",
  "dr.shahid.nawaz@apnadoctor.pk": "specialist_weekdays",

  // General Physicians
  "dr.khalid.butt@apnadoctor.pk": "full_week_split",
  "dr.rubina.saleem@apnadoctor.pk": "full_week_split",
  "dr.naveed.iqbal@apnadoctor.pk": "full_week_split",
  "dr.tahira.noman@apnadoctor.pk": "full_week_split",
  "dr.asim.rehman@apnadoctor.pk": "senior_consultant",

  // Gynecologists
  "dr.nusrat.parveen@apnadoctor.pk": "alternate_days",
  "dr.shazia.nawaz@apnadoctor.pk": "alternate_days",
  "dr.fareena.tariq@apnadoctor.pk": "senior_consultant",
  "dr.huma.arif@apnadoctor.pk": "specialist_weekdays",
  "dr.raheela.siddiq@apnadoctor.pk": "specialist_weekdays",

  // Neurologists
  "dr.zafar.mirza@apnadoctor.pk": "senior_consultant",
  "dr.aneela.arooj@apnadoctor.pk": "specialist_weekdays",
  "dr.tariq.aziz@apnadoctor.pk": "senior_consultant",
  "dr.maryam.sajid@apnadoctor.pk": "specialist_weekdays",
  "dr.waseem.abbas@apnadoctor.pk": "specialist_weekdays",

  // Orthopedics
  "dr.imtiaz.chaudhry@apnadoctor.pk": "senior_consultant",
  "dr.rabia.jehangir@apnadoctor.pk": "alternate_days",
  "dr.shehryar.khan@apnadoctor.pk": "alternate_days",
  "dr.adnan.riaz@apnadoctor.pk": "alternate_days",
  "dr.shahzad.aslam@apnadoctor.pk": "specialist_weekdays",

  // Pediatricians
  "dr.shamim.akhtar@apnadoctor.pk": "senior_consultant",
  "dr.raza.haider@apnadoctor.pk": "full_week_split",
  "dr.faria.khalil@apnadoctor.pk": "specialist_weekdays",
  "dr.asad.mehmood@apnadoctor.pk": "full_week_split",
  "dr.yasmin.arshad@apnadoctor.pk": "senior_consultant",

  // Psychiatrists
  "dr.yusuf.salahuddin@apnadoctor.pk": "evening_only",
  "dr.samira.baig@apnadoctor.pk": "evening_only",
  "dr.faheem.qasim@apnadoctor.pk": "evening_only",
  "dr.kiran.zahid@apnadoctor.pk": "specialist_weekdays",
  "dr.bilal.sarwar@apnadoctor.pk": "evening_only",

  // Urologists
  "dr.rashid.usman@apnadoctor.pk": "alternate_days",
  "dr.misbah.nasreen@apnadoctor.pk": "specialist_weekdays",
  "dr.farhan.ijaz@apnadoctor.pk": "alternate_days",
  "dr.saeed.gill@apnadoctor.pk": "specialist_weekdays",
  "dr.omar.shahid@apnadoctor.pk": "specialist_weekdays",
};

async function seed() {
  console.log("Fetching doctors from database...");

  const { data: doctors, error } = await supabase
    .from("doctors")
    .select("id, email, full_name")
    .order("created_at");

  if (error || !doctors) {
    console.error("Failed to fetch doctors:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${doctors.length} doctors. Generating availability...`);

  const rows: {
    doctor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration: number;
    is_active: boolean;
  }[] = [];

  for (const doctor of doctors) {
    const patternKey = doctorPatterns[doctor.email];

    if (!patternKey) {
      console.warn(
        `No pattern found for ${doctor.email}, using full_week_split`
      );
    }

    const pattern = patterns[patternKey ?? "full_week_split"];

    for (const block of pattern) {
      for (const day of block.days) {
        rows.push({
          doctor_id: doctor.id,
          day_of_week: day,
          start_time: block.start_time,
          end_time: block.end_time,
          slot_duration: block.slot_duration,
          is_active: true,
        });
      }
    }
  }

  console.log(`Inserting ${rows.length} availability records...`);

  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from("doctor_availability")
      .insert(batch);

    if (insertError) {
      console.error(`Batch insert error at index ${i}:`, insertError.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${rows.length}`);
    }
  }

  console.log(`\nDone! ${inserted} availability records created.`);
}

seed();
