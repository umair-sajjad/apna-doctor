import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Mock AI responses - replace with actual AI model later
function generateMockResponse(message: string, conversationHistory: any[]) {
  const lowercaseMessage = message.toLowerCase();

  // Extract intent
  if (conversationHistory.length === 0) {
    return {
      response:
        "Hello! I'm your ApnaDoctor assistant. I can help you find the right doctor. What brings you here today? You can tell me about your health concern, or I can help you search by specialty.",
      suggestions: [
        "I'm not feeling well",
        "I need a specialist",
        "Book a checkup",
      ],
      stage: "greeting",
    };
  }

  // Check for symptoms/complaints
  if (
    lowercaseMessage.includes("pain") ||
    lowercaseMessage.includes("hurt") ||
    lowercaseMessage.includes("sick") ||
    lowercaseMessage.includes("problem")
  ) {
    return {
      response:
        "I understand you're experiencing some discomfort. Can you tell me more specifically where or what kind of issue you're having? For example: skin problems, stomach pain, headache, etc.",
      suggestions: ["Skin issue", "Stomach pain", "Headache", "Chest pain"],
      stage: "collecting_symptoms",
    };
  }

  // Specialty matching
  const specialtyMap: Record<string, string> = {
    skin: "Dermatologist",
    heart: "Cardiologist",
    stomach: "Gastroenterologist",
    child: "Pediatrician",
    teeth: "Dentist",
    bone: "Orthopedic",
    headache: "Neurologist",
    general: "General Physician",
  };

  let detectedSpecialty = null;
  for (const [keyword, specialty] of Object.entries(specialtyMap)) {
    if (lowercaseMessage.includes(keyword)) {
      detectedSpecialty = specialty;
      break;
    }
  }

  if (detectedSpecialty) {
    return {
      response: `For ${lowercaseMessage}, you should see a ${detectedSpecialty}. I can help you find one near you. What city are you in?`,
      suggestions: ["Lahore", "Karachi", "Islamabad"],
      extractedData: {
        specialty: detectedSpecialty,
      },
      stage: "collecting_location",
    };
  }

  // Location confirmation
  if (
    lowercaseMessage.includes("lahore") ||
    lowercaseMessage.includes("karachi") ||
    lowercaseMessage.includes("islamabad")
  ) {
    const city = lowercaseMessage.includes("lahore")
      ? "Lahore"
      : lowercaseMessage.includes("karachi")
        ? "Karachi"
        : "Islamabad";

    return {
      response: `Great! I'll search for doctors in ${city}. Do you have any preferences? Like gender of the doctor or language?`,
      suggestions: [
        "No preference",
        "Female doctor",
        "Male doctor",
        "Urdu speaking",
      ],
      extractedData: {
        city: city,
      },
      stage: "collecting_preferences",
    };
  }

  // Ready to search
  if (
    lowercaseMessage.includes("no preference") ||
    lowercaseMessage.includes("any") ||
    lowercaseMessage.includes("search")
  ) {
    return {
      response:
        "Perfect! Let me search for the best doctors for you. Click 'View Results' below to see available doctors.",
      suggestions: ["View Results"],
      stage: "ready_to_search",
    };
  }

  // Default response
  return {
    response:
      "I'm here to help you find a doctor. Could you tell me what health concern you have or which type of specialist you need?",
    suggestions: [
      "General checkup",
      "Skin specialist",
      "Heart specialist",
      "Child specialist",
    ],
    stage: "collecting_info",
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { message, sessionId, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate mock AI response
    const aiResponse = generateMockResponse(message, conversationHistory);

    // Store conversation in database
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && sessionId) {
      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("id", sessionId)
        .single();

      if (!existingConversation) {
        // Create conversation
        await supabase.from("chat_conversations").insert({
          id: sessionId,
          user_id: user.id,
          status: "active",
        });
      }

      // Store messages
      await supabase.from("chat_messages").insert([
        {
          conversation_id: sessionId,
          role: "user",
          content: message,
        },
        {
          conversation_id: sessionId,
          role: "assistant",
          content: aiResponse.response,
        },
      ]);
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
