import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Convert date range param to a ISO cutoff string (or null for "all")
function rangeCutoff(range: string): string | null {
  const now = Date.now();
  const map: Record<string, number> = {
    "7d":  7  * 86400000,
    "30d": 30 * 86400000,
    "3m":  90 * 86400000,
    "1y":  365 * 86400000,
  };
  if (!map[range]) return null;
  return new Date(now - map[range]).toISOString();
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type   = searchParams.get("type") ?? "users";
  const range  = searchParams.get("range") ?? "all";
  const cutoff = rangeCutoff(range);

  let csv = "";
  let filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;

  // ── Users ─────────────────────────────────────────────────────────────────
  if (type === "users") {
    let q = adminSupabase
      .from("users")
      .select("id, full_name, email, phone, created_at")
      .order("created_at", { ascending: false });
    if (cutoff) q = q.gte("created_at", cutoff);
    const { data } = await q;

    csv = toCSV(
      ["ID", "Full Name", "Email", "Phone", "Registered At"],
      (data ?? []).map((u) => [
        u.id,
        u.full_name,
        u.email,
        u.phone ?? "",
        u.created_at ? new Date(u.created_at).toLocaleDateString("en-PK") : "",
      ])
    );
  }

  // ── Revenue ───────────────────────────────────────────────────────────────
  else if (type === "revenue") {
    let q = adminSupabase
      .from("payment_transactions")
      .select(
        "id, amount, currency, status, payment_method_type, paid_at, created_at, stripe_payment_intent_id, appointments(booking_reference, appointment_date, patient_name, doctors(full_name, specialization), users(full_name))"
      )
      .eq("status", "succeeded")
      .order("paid_at", { ascending: false });
    if (cutoff) q = q.gte("paid_at", cutoff);
    const { data } = await q;

    csv = toCSV(
      ["Date", "Booking Ref", "Patient", "Doctor", "Specialization", "Amount (PKR)", "Method", "Stripe PI"],
      (data ?? []).map((tx: any) => [
        tx.paid_at ? new Date(tx.paid_at).toLocaleDateString("en-PK") : "",
        tx.appointments?.booking_reference ?? "",
        tx.appointments?.users?.full_name ?? tx.appointments?.patient_name ?? "",
        tx.appointments?.doctors ? `Dr. ${tx.appointments.doctors.full_name}` : "",
        tx.appointments?.doctors?.specialization ?? "",
        tx.amount,
        tx.payment_method_type ?? "card",
        tx.stripe_payment_intent_id,
      ])
    );
  }

  // ── Appointments ──────────────────────────────────────────────────────────
  else if (type === "appointments") {
    let q = adminSupabase
      .from("appointments")
      .select(
        "id, booking_reference, appointment_date, appointment_time, status, consultation_fee, patient_name, created_at, doctors(full_name, specialization), users(full_name, email)"
      )
      .order("appointment_date", { ascending: false });
    if (cutoff) q = q.gte("created_at", cutoff);
    const { data } = await q;

    csv = toCSV(
      ["Booking Ref", "Date", "Time", "Patient", "Doctor", "Specialization", "Fee (PKR)", "Status", "Booked At"],
      (data ?? []).map((a: any) => [
        a.booking_reference ?? "",
        a.appointment_date ?? "",
        a.appointment_time ?? "",
        a.users?.full_name ?? a.patient_name ?? "",
        a.doctors ? `Dr. ${a.doctors.full_name}` : "",
        a.doctors?.specialization ?? "",
        a.consultation_fee ?? "",
        a.status,
        a.created_at ? new Date(a.created_at).toLocaleDateString("en-PK") : "",
      ])
    );
  }

  // ── Doctor Performance ────────────────────────────────────────────────────
  else if (type === "doctors") {
    const [{ data: doctors }, { data: appts }, { data: payments }] = await Promise.all([
      adminSupabase
        .from("doctors")
        .select("id, full_name, specialization, average_rating, total_reviews, is_verified, created_at")
        .order("full_name"),
      adminSupabase
        .from("appointments")
        .select("doctor_id, status"),
      adminSupabase
        .from("payment_transactions")
        .select("amount, appointments(doctor_id)")
        .eq("status", "succeeded"),
    ]);

    // Build per-doctor aggregates
    const apptMap = new Map<string, { total: number; completed: number; cancelled: number }>();
    for (const a of appts ?? []) {
      const prev = apptMap.get(a.doctor_id) ?? { total: 0, completed: 0, cancelled: 0 };
      prev.total++;
      if (a.status === "completed")  prev.completed++;
      if (a.status === "cancelled")  prev.cancelled++;
      apptMap.set(a.doctor_id, prev);
    }

    const revenueMap = new Map<string, number>();
    for (const p of payments ?? []) {
      const did = (p as any).appointments?.doctor_id;
      if (did) revenueMap.set(did, (revenueMap.get(did) ?? 0) + p.amount);
    }

    csv = toCSV(
      ["Doctor", "Specialization", "Verified", "Total Appts", "Completed", "Cancelled", "Avg Rating", "Reviews", "Revenue (PKR)", "Joined"],
      (doctors ?? []).map((d) => {
        const stats = apptMap.get(d.id) ?? { total: 0, completed: 0, cancelled: 0 };
        return [
          `Dr. ${d.full_name}`,
          d.specialization ?? "",
          d.is_verified ? "Yes" : "No",
          stats.total,
          stats.completed,
          stats.cancelled,
          d.average_rating ?? 0,
          d.total_reviews ?? 0,
          revenueMap.get(d.id) ?? 0,
          d.created_at ? new Date(d.created_at).toLocaleDateString("en-PK") : "",
        ];
      })
    );
  }

  // ── Payment Transactions (all statuses) ───────────────────────────────────
  else if (type === "payments") {
    let q = adminSupabase
      .from("payment_transactions")
      .select(
        "id, stripe_payment_intent_id, amount, currency, status, payment_method_type, failure_message, paid_at, created_at, appointments(booking_reference, appointment_date, patient_name, doctors(full_name), users(full_name))"
      )
      .order("created_at", { ascending: false });
    if (cutoff) q = q.gte("created_at", cutoff);
    const { data } = await q;

    csv = toCSV(
      ["Date", "Booking Ref", "Patient", "Doctor", "Amount (PKR)", "Method", "Status", "Stripe PI", "Failure Reason"],
      (data ?? []).map((tx: any) => [
        new Date(tx.paid_at ?? tx.created_at).toLocaleDateString("en-PK"),
        tx.appointments?.booking_reference ?? "",
        tx.appointments?.users?.full_name ?? tx.appointments?.patient_name ?? "",
        tx.appointments?.doctors ? `Dr. ${tx.appointments.doctors.full_name}` : "",
        tx.amount,
        tx.payment_method_type ?? "card",
        tx.status,
        tx.stripe_payment_intent_id,
        tx.failure_message ?? "",
      ])
    );
  }

  else {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
