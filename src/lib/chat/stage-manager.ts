import { createClient, createServiceClient } from "@/lib/supabase/server";
import { callLLM } from "./llm";
import {
  buildStage1Prompt,
  buildStage6Prompt,
  buildConfirmationPrompt,
  buildOffTopicPrompt,
  buildNameSearchPrompt,
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
  doctors_offset: 0,
  shown_doctor_ids: [],
  fallback_offered: false,
  doctor_name_query: null,
};

const SHOW_MORE_KEYWORDS = [
  "show more",
  "more doctors",
  "other doctors",
  "see more",
  "any more",
  "more options",
  "next",
  "others",
  "more",
];

function isShowMoreIntent(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return SHOW_MORE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isFallbackAccepted(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return (
    lower.includes("yes") ||
    lower.includes("ok") ||
    lower.includes("sure") ||
    lower.includes("okay") ||
    lower.includes("please") ||
    lower.includes("haan") ||
    lower.includes("han") ||
    lower === "y"
  );
}

function isFallbackRejected(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return (
    lower.includes("no") ||
    lower.includes("nahi") ||
    lower.includes("nope") ||
    lower.includes("dont") ||
    lower.includes("don't") ||
    lower === "n"
  );
}

function generateConversationTitle(message: string): string {
  const cleaned = message
    .trim()
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").slice(0, 8).join(" ");
  const titled = words.charAt(0).toUpperCase() + words.slice(1);
  return titled.length > 60 ? titled.slice(0, 57) + "..." : titled;
}

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

  const isFirstMessage =
    !conversation.extracted_data ||
    (conversation.extracted_data as ExtractedData).stage === "greeting";

  const state: ExtractedData = {
    ...DEFAULT_EXTRACTED_DATA,
    ...(conversation.extracted_data as Partial<ExtractedData>),
  };

  const recentMessages = await getRecentMessages(
    serviceSupabase,
    conversationId
  );

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
    response = await handleTextMessage(
      supabase,
      state,
      userId,
      userMessage,
      recentMessages
    );
  }

  await updateConversationState(
    serviceSupabase,
    conversationId,
    state,
    response.stage,
    isFirstMessage && !action ? userMessage : undefined
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
  message: string,
  history: { role: string; content: string }[] = []
): Promise<ChatApiResponse> {
  if (state.stage === "collecting_info") {
    return handleInfoCollection(supabase, state, userId, message);
  }

  if (state.stage === "showing_doctors" && isShowMoreIntent(message)) {
    return handleShowMoreDoctors(supabase, state, userId);
  }

  if (state.stage === "showing_doctors" && state.fallback_offered) {
    if (isFallbackAccepted(message)) {
      state.specialty = "General Physician";
      state.doctors_offset = 0;
      state.shown_doctor_ids = [];
      state.fallback_offered = false;
      return handleSearchDoctors(supabase, state, userId);
    }
    if (isFallbackRejected(message)) {
      state.fallback_offered = false;
      return {
        response:
          "No problem! You can describe a different health concern and I'll find the right specialist for you.",
        stage: "greeting",
      };
    }
  }

  const llmRes = await callLLM(buildStage1Prompt(message, history));

  if (llmRes.intent === "off_topic") {
    const redirectRes = await callLLM(
      buildOffTopicPrompt(message, state.stage, history)
    );
    return { response: redirectRes.response, stage: state.stage };
  }

  if (
    llmRes.intent === "greeting" ||
    llmRes.intent === "unclear" ||
    llmRes.intent === "health_question"
  ) {
    return {
      response: llmRes.response,
      stage: state.stage === "greeting" ? "greeting" : state.stage,
    };
  }

  if (llmRes.intent === "doctor_name_search") {
    return handleDoctorNameSearch(supabase, state, userId, message);
  }

  if (llmRes.needs_clarification) {
    return { response: llmRes.response, stage: "understanding_problem" };
  }

  state.symptoms = llmRes.symptoms || [];
  state.specialty = llmRes.specialty || null;
  state.doctors_offset = 0;
  state.shown_doctor_ids = [];
  state.fallback_offered = false;

  if (!state.specialty) {
    return { response: llmRes.response, stage: "understanding_problem" };
  }

  return handleSearchDoctors(supabase, state, userId);
}

async function handleSearchDoctors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string
): Promise<ChatApiResponse> {
  const doctors = await searchDoctors(
    supabase,
    state.specialty!,
    userId,
    state.doctors_offset,
    state.shown_doctor_ids
  );

  if (doctors.length === 0) {
    if (state.specialty !== "General Physician") {
      state.fallback_offered = true;
      return {
        response: `I couldn't find any ${state.specialty}s available near you right now. Would you like me to search for a General Physician instead?`,
        stage: "showing_doctors",
      };
    }
    return {
      response:
        "I'm sorry, I couldn't find any available doctors near you at the moment. Please try again later or contact us for assistance.",
      stage: "greeting",
    };
  }

  state.shown_doctor_ids = [
    ...state.shown_doctor_ids,
    ...doctors.map((d) => d.id),
  ];
  state.doctors_offset = state.shown_doctor_ids.length;
  state.stage = "showing_doctors";

  const isFirstBatch = state.doctors_offset <= 5;
  const response = isFirstBatch
    ? `I found some ${state.specialty}s near you. Here are the top matches:`
    : `Here are more ${state.specialty}s you can choose from:`;

  return { response, stage: "showing_doctors", doctors };
}

async function handleShowMoreDoctors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string
): Promise<ChatApiResponse> {
  if (!state.specialty) {
    return {
      response:
        "Please tell me your health concern first so I can find the right doctors for you.",
      stage: "greeting",
    };
  }

  const doctors = await searchDoctors(
    supabase,
    state.specialty,
    userId,
    state.doctors_offset,
    state.shown_doctor_ids
  );

  if (doctors.length === 0) {
    if (state.specialty !== "General Physician" && !state.fallback_offered) {
      state.fallback_offered = true;
      return {
        response: `I've shown you all available ${state.specialty}s near you. Would you like me to search for a General Physician instead?`,
        stage: "showing_doctors",
      };
    }
    return {
      response: `I'm sorry, there are no more ${state.specialty}s available near you right now. You can try a different specialty or check back later.`,
      stage: "showing_doctors",
    };
  }

  state.shown_doctor_ids = [
    ...state.shown_doctor_ids,
    ...doctors.map((d) => d.id),
  ];
  state.doctors_offset = state.shown_doctor_ids.length;

  return {
    response: `Here are more ${state.specialty}s near you:`,
    stage: "showing_doctors",
    doctors,
  };
}

async function handleDoctorSelection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  doctorId: string
): Promise<ChatApiResponse> {
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
  const slots = await getAvailableSlots(doctorId);

  if (Object.keys(slots).length === 0) {
    return {
      response: `Dr. ${doctor.full_name} has no available slots in the next 7 days. Please select a different doctor.`,
      stage: "showing_doctors",
    };
  }

  return {
    response: `Here are the available slots for Dr. ${doctor.full_name}. Please select a time that works for you:`,
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
      response:
        "That slot was just booked by someone else. Please choose another time:",
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
    response: "Almost there! Could I get your full name please?",
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
  const { data: doctor } = await supabase
    .from("doctors")
    .select("full_name, specialization, consultation_fee, clinic_name, city")
    .eq("id", state.selected_doctor_id!)
    .single();

  if (!doctor) {
    return {
      response:
        "Something went wrong fetching doctor details. Please start over.",
      stage: "greeting",
    };
  }

  const bookingReference = `APT-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;

  const { error } = await supabase.from("appointments").insert({
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
  });

  if (error) {
    console.error("Booking insert error:", error);
    return {
      response: "Failed to create your booking. Please try again.",
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
  userId: string,
  offset: number = 0,
  excludeIds: string[] = []
): Promise<DoctorResult[]> {
  const { data: user } = await supabase
    .from("users")
    .select("location_lat, location_lng, city")
    .eq("id", userId)
    .single();

  if (user?.location_lat && user?.location_lng) {
    const { data, error } = await supabase.rpc("get_nearby_doctors_for_chat", {
      p_lat: user.location_lat,
      p_lng: user.location_lng,
      p_specialty: specialty,
      p_radius_meters: 10000,
      p_limit: 5,
      p_exclude_ids: excludeIds.length > 0 ? excludeIds : [],
    });

    if (error) console.error("PostGIS search error:", error);
    if (data && data.length > 0) return data as DoctorResult[];

    const { data: expanded } = await supabase.rpc(
      "get_nearby_doctors_for_chat",
      {
        p_lat: user.location_lat,
        p_lng: user.location_lng,
        p_specialty: specialty,
        p_radius_meters: 25000,
        p_limit: 5,
        p_exclude_ids: excludeIds.length > 0 ? excludeIds : [],
      }
    );

    if (expanded && expanded.length > 0) return expanded as DoctorResult[];
  }

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

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  if (user?.city) {
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
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("id, extracted_data")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
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

  return created!;
}

async function updateConversationState(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  state: ExtractedData,
  stage: string,
  firstUserMessage?: string
) {
  const updatedState = { ...state, stage };
  const updates: Record<string, unknown> = {
    extracted_data: updatedState,
    updated_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };

  if (stage === "completed") {
    updates.status = "completed";
    updates.outcome_type = "booking_created";
  }

  if (firstUserMessage) {
    updates.title = generateConversationTitle(firstUserMessage);
  }

  await supabase
    .from("chat_conversations")
    .update(updates)
    .eq("id", conversationId);
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

async function handleDoctorNameSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  state: ExtractedData,
  userId: string,
  message: string
): Promise<ChatApiResponse> {
  const llmRes = await callLLM(buildNameSearchPrompt(message));
  const doctorName = llmRes.doctor_name;

  if (!doctorName) {
    return {
      response:
        "I couldn't find a doctor name in your message. Could you please tell me the doctor's full name?",
      stage: "understanding_problem",
    };
  }

  state.doctor_name_query = doctorName;

  const { data: doctors } = await supabase
    .from("doctors")
    .select(
      "id, full_name, specialization, consultation_fee, average_rating, total_reviews, profile_image, clinic_name, city, experience"
    )
    .ilike("full_name", `%${doctorName}%`)
    .eq("is_verified", true)
    .eq("is_active", true)
    .order("average_rating", { ascending: false })
    .limit(5);

  if (!doctors || doctors.length === 0) {
    return {
      response: `I couldn't find any verified doctor named "${doctorName}" on ApnaDoctor. Please check the name and try again, or I can help you find a doctor by specialty instead.`,
      stage: "understanding_problem",
    };
  }

  state.shown_doctor_ids = doctors.map((d) => d.id);
  state.stage = "showing_doctors";

  const response =
    doctors.length === 1
      ? `I found Dr. ${doctors[0].full_name}, a ${doctors[0].specialization}. Would you like to book an appointment?`
      : `I found ${doctors.length} doctors matching "${doctorName}". Please select one:`;

  return {
    response,
    stage: "showing_doctors",
    doctors: doctors as DoctorResult[],
  };
}

async function getRecentMessages(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  limit: number = 6
): Promise<{ role: string; content: string }[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).reverse();
}
