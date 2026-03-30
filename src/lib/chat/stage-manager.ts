import { createClient, createServiceClient } from "@/lib/supabase/server";
import { callLLM } from "./llm";
import {
  buildStage1Prompt,
  buildStage6Prompt,
  buildConfirmationPrompt,
  buildOffTopicPrompt,
} from "./prompts";
import { getAvailableSlots } from "./slot-generator";
import { ExtractedData, ChatApiResponse, DoctorResult } from "@/types/chat";
import { nanoid } from "nanoid";

const DEFAULT_EXTRACTED_DATA: ExtractedData = {
  stage: "greeting",
  symptoms: [],
  specialty: null,
  location: { lat: null, lng: null, city: null },
  selected_doctor_id: null,
  selected_slot: { date: null, time: null },
  patient_info: { name: null, phone: null, email: null },
};

export async function processMessage(
  conversationId: string,
  userId: string,
  userMessage: string,
  action?: string,
  payload?: Record<string, string>
): Promise<ChatApiResponse> {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const conversation = await getOrCreateConversation(
    serviceSupabase,
    conversationId,
    userId
  );

  const state: ExtractedData = {
    ...DEFAULT_EXTRACTED_DATA,
    ...(conversation.extracted_data as Partial<ExtractedData>),
  };

  console.log("=== processMessage ===");
  console.log("ConversationId:", conversationId);
  console.log("Action:", action);
  console.log("Loaded state:", JSON.stringify(state));

  await saveMessage(serviceSupabase, conversationId, "user", userMessage);

  let response: ChatApiResponse;

  if (action === "select_doctor" && payload?.doctor_id) {
    response = await handleDoctorSelection(supabase, state, payload.doctor_id);
  } else if (action === "select_slot" && payload?.date && payload?.time) {
    response = await handleSlotSelection(
      supabase,
      state,
      userId,
      payload.date,
      payload.time
    );
  } else {
    response = await handleTextMessage(supabase, state, userId, userMessage);
  }

  await updateConversationState(
    serviceSupabase,
    conversationId,
    state,
    response.stage
  );
  await saveMessage(
    serviceSupabase,
    conversationId,
    "assistant",
    response.response
  );

  return response;
}

async function handleTextMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string,
  message: string
): Promise<ChatApiResponse> {
  if (state.stage === "collecting_info") {
    return handleInfoCollection(supabase, state, userId, message);
  }

  const llmRes = await callLLM(buildStage1Prompt(message));

  if (
    llmRes.intent === "off_topic" ||
    (llmRes.intent !== "health_concern" &&
      llmRes.intent !== "greeting" &&
      llmRes.intent !== "unclear" &&
      state.stage !== "greeting")
  ) {
    const redirectRes = await callLLM(
      buildOffTopicPrompt(message, state.stage)
    );
    return { response: redirectRes.response, stage: state.stage };
  }

  if (llmRes.intent === "greeting" || llmRes.intent === "unclear") {
    return { response: llmRes.response, stage: "greeting" };
  }

  if (llmRes.needs_clarification) {
    return { response: llmRes.response, stage: "understanding_problem" };
  }

  state.symptoms = llmRes.symptoms || [];
  state.specialty = llmRes.specialty || null;

  if (!state.specialty) {
    return { response: llmRes.response, stage: "understanding_problem" };
  }

  const doctors = await searchDoctors(supabase, state.specialty, userId);

  if (doctors.length === 0) {
    return {
      response: `I found no ${state.specialty}s available right now. Please try a different specialty or check back later.`,
      stage: "understanding_problem",
    };
  }

  state.stage = "showing_doctors";

  return {
    response: `I found ${doctors.length} ${state.specialty}(s) for you. Please select one:`,
    stage: "showing_doctors",
    doctors,
  };
}

async function handleDoctorSelection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  doctorId: string
): Promise<ChatApiResponse> {
  console.log("=== handleDoctorSelection ===");
  console.log("Doctor ID:", doctorId);

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, full_name, is_active, is_verified")
    .eq("id", doctorId)
    .eq("is_active", true)
    .eq("is_verified", true)
    .single();

  if (!doctor) {
    return {
      response: "This doctor is no longer available. Please select another.",
      stage: "showing_doctors",
    };
  }

  state.selected_doctor_id = doctorId;
  console.log("State after doctor selection:", JSON.stringify(state));

  const slots = await getAvailableSlots(doctorId);

  if (Object.keys(slots).length === 0) {
    return {
      response: `Dr. ${doctor.full_name} has no available slots in the next 7 days. Please select a different doctor.`,
      stage: "showing_doctors",
    };
  }

  return {
    response: `Here are the available slots for Dr. ${doctor.full_name}. Please select a time:`,
    stage: "showing_slots",
    slots,
  };
}

async function handleSlotSelection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string,
  date: string,
  time: string
): Promise<ChatApiResponse> {
  console.log("=== handleSlotSelection ===");
  console.log("selected_doctor_id:", state.selected_doctor_id);
  console.log("Date:", date, "Time:", time);

  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", state.selected_doctor_id!)
    .eq("appointment_date", date)
    .eq("appointment_time", time)
    .in("status", ["pending", "confirmed"]);

  if (count && count > 0) {
    const slots = await getAvailableSlots(state.selected_doctor_id!);
    return {
      response: "That slot was just booked. Please choose another:",
      stage: "showing_slots",
      slots,
    };
  }

  state.selected_slot = { date, time };

  const { data: user } = await supabase
    .from("users")
    .select("full_name, phone, email")
    .eq("id", userId)
    .single();

  if (user?.full_name && user?.phone) {
    state.patient_info = {
      name: user.full_name,
      phone: user.phone,
      email: user.email,
    };
    return createBooking(supabase, state, userId);
  }

  state.patient_info = {
    name: user?.full_name || null,
    phone: user?.phone || null,
    email: user?.email || null,
  };

  return {
    response: "Almost there! What is your full name?",
    stage: "collecting_info",
  };
}

async function handleInfoCollection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string,
  message: string
): Promise<ChatApiResponse> {
  const llmRes = await callLLM(buildStage6Prompt(message, state.patient_info));

  state.patient_info = {
    name: llmRes.collected?.name || state.patient_info.name,
    phone: llmRes.collected?.phone || state.patient_info.phone,
    email: state.patient_info.email,
  };

  if (!llmRes.all_collected) {
    return { response: llmRes.response, stage: "collecting_info" };
  }

  return createBooking(supabase, state, userId);
}

async function createBooking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string
): Promise<ChatApiResponse> {
  console.log("=== createBooking ===");
  console.log("userId:", userId);
  console.log("selected_doctor_id:", state.selected_doctor_id);

  const { data: doctor } = await supabase
    .from("doctors")
    .select("full_name, specialization, consultation_fee, clinic_name, city")
    .eq("id", state.selected_doctor_id!)
    .single();

  console.log("Doctor fetched:", JSON.stringify(doctor));

  if (!doctor) {
    return {
      response: "Something went wrong. Please start over.",
      stage: "greeting",
    };
  }

  const bookingReference = `APT-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;

  const insertPayload = {
    doctor_id: state.selected_doctor_id!,
    user_id: userId,
    appointment_date: state.selected_slot.date!,
    appointment_time: state.selected_slot.time!,
    duration: 30,
    status: "pending",
    booking_reference: bookingReference,
    patient_name: state.patient_info.name!,
    patient_phone: state.patient_info.phone!,
    patient_email: state.patient_info.email || "",
    chief_complaint: state.symptoms.join(", "),
    consultation_fee: doctor.consultation_fee,
    payment_status: "pending",
  };

  console.log("Insert payload:", JSON.stringify(insertPayload));

  const { error } = await supabase.from("appointments").insert(insertPayload);

  console.log("Insert error:", JSON.stringify(error));

  if (error) {
    return {
      response: "Failed to create booking. Please try again.",
      stage: "slot_selected",
    };
  }

  const llmRes = await callLLM(
    buildConfirmationPrompt({
      doctor_name: doctor.full_name,
      specialization: doctor.specialization,
      date: state.selected_slot.date!,
      time: state.selected_slot.time!,
      clinic_name: doctor.clinic_name,
      city: doctor.city,
      consultation_fee: doctor.consultation_fee,
      booking_reference: bookingReference,
    })
  );

  return {
    response: llmRes.response,
    stage: "completed",
    booking: {
      booking_reference: bookingReference,
      doctor_name: doctor.full_name,
      date: state.selected_slot.date!,
      time: state.selected_slot.time!,
      clinic_name: doctor.clinic_name,
      consultation_fee: doctor.consultation_fee,
    },
  };
}

async function searchDoctors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  specialty: string,
  userId: string
): Promise<DoctorResult[]> {
  const { data: user } = await supabase
    .from("users")
    .select("location_lat, location_lng, city")
    .eq("id", userId)
    .single();

  let query = supabase
    .from("doctors")
    .select(
      "id, full_name, specialization, consultation_fee, average_rating, total_reviews, profile_image, clinic_name, city, experience"
    )
    .eq("specialization", specialty)
    .eq("is_verified", true)
    .eq("is_active", true)
    .order("average_rating", { ascending: false })
    .limit(5);

  if (!user?.location_lat && user?.city) {
    query = query.eq("city", user.city);
  }

  const { data } = await query;
  return (data as DoctorResult[]) || [];
}

async function getOrCreateConversation(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  userId: string
) {
  const { data: existing, error } = await supabase
    .from("chat_conversations")
    .select("id, extracted_data")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  console.log("Fetched conversation:", JSON.stringify(existing));
  console.log("Fetch error:", JSON.stringify(error));

  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("chat_conversations")
    .insert({
      id: conversationId,
      session_id: conversationId,
      user_id: userId,
      status: "active",
      extracted_data: DEFAULT_EXTRACTED_DATA,
    })
    .select("id, extracted_data")
    .single();

  console.log("Created conversation:", JSON.stringify(created));
  console.log("Create error:", JSON.stringify(createError));

  return created!;
}

async function updateConversationState(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  state: ExtractedData,
  stage: string
) {
  const updatedState = { ...state, stage };
  const updates: Record<string, unknown> = { extracted_data: updatedState };

  if (stage === "completed") {
    updates.status = "completed";
    updates.outcome_type = "booking_created";
  }

  const { error } = await supabase
    .from("chat_conversations")
    .update(updates)
    .eq("id", conversationId);

  console.log("State saved to DB:", JSON.stringify(updatedState));
  console.log("DB update error:", JSON.stringify(error));
}

async function saveMessage(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });
}
