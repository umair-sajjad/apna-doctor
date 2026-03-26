import { SlotsByDate } from "@/types/chat";
import { createClient } from "@/lib/supabase/server";
import { addDays, format, getDay } from "date-fns";

export async function getAvailableSlots(
  doctorId: string
): Promise<SlotsByDate> {
  const supabase = await createClient();
  const today = new Date();
  const slots: SlotsByDate = {};

  const [availabilityRes, exceptionsRes, appointmentsRes] = await Promise.all([
    supabase
      .from("doctor_availability")
      .select("day_of_week, start_time, end_time, slot_duration")
      .eq("doctor_id", doctorId)
      .eq("is_active", true),

    supabase
      .from("availability_exceptions")
      .select("date, is_available")
      .eq("doctor_id", doctorId)
      .gte("date", format(today, "yyyy-MM-dd"))
      .lte("date", format(addDays(today, 7), "yyyy-MM-dd")),

    supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("doctor_id", doctorId)
      .gte("appointment_date", format(today, "yyyy-MM-dd"))
      .lte("appointment_date", format(addDays(today, 7), "yyyy-MM-dd"))
      .in("status", ["pending", "confirmed"]),
  ]);

  const availability = availabilityRes.data || [];
  const exceptions = exceptionsRes.data || [];
  const booked = appointmentsRes.data || [];

  const blockedDates = new Set(
    exceptions.filter((e) => !e.is_available).map((e) => e.date)
  );

  const bookedSlots = new Set(
    booked.map((a) => `${a.appointment_date}_${a.appointment_time}`)
  );

  for (let i = 1; i <= 7; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date);

    if (blockedDates.has(dateStr)) continue;

    const schedule = availability.find((a) => a.day_of_week === dayOfWeek);
    if (!schedule) continue;

    const daySlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration
    ).filter((time) => !bookedSlots.has(`${dateStr}_${time}`));

    if (daySlots.length > 0) {
      slots[dateStr] = daySlots;
    }
  }

  return slots;
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const m = (current % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }

  return slots;
}
