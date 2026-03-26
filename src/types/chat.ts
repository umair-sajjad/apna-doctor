export type ChatStage =
  | "greeting"
  | "understanding_problem"
  | "showing_doctors"
  | "doctor_selected"
  | "showing_slots"
  | "slot_selected"
  | "collecting_info"
  | "confirming"
  | "completed";

export type ChatIntent =
  | "health_concern"
  | "off_topic"
  | "greeting"
  | "unclear"
  | "select_doctor"
  | "select_slot"
  | "provide_info";

export interface ExtractedData {
  stage: ChatStage;
  symptoms: string[];
  specialty: string | null;
  location: {
    lat: number | null;
    lng: number | null;
    city: string | null;
  };
  selected_doctor_id: string | null;
  selected_slot: {
    date: string | null;
    time: string | null;
  };
  patient_info: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
}

export interface DoctorResult {
  id: string;
  full_name: string;
  specialization: string;
  consultation_fee: number;
  average_rating: number;
  total_reviews: number;
  profile_image: string | null;
  clinic_name: string;
  city: string;
  experience: number;
}

export interface SlotsByDate {
  [date: string]: string[];
}

export interface ChatApiRequest {
  message: string;
  conversationId: string;
  action?: "select_doctor" | "select_slot";
  payload?: { doctor_id?: string; date?: string; time?: string };
}

export interface ChatApiResponse {
  response: string;
  stage: ChatStage;
  doctors?: DoctorResult[];
  slots?: SlotsByDate;
  booking?: {
    booking_reference: string;
    doctor_name: string;
    date: string;
    time: string;
    clinic_name: string;
    consultation_fee: number;
  };
  error?: string;
}
