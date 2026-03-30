import { LLMResponse } from "@/types/chat";
import { callGroq } from "./providers/groq";
import { callOllama } from "./providers/ollama";

export type { LLMResponse };

export async function callLLM(prompt: string): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || "groq";

  console.log(`[LLM] Using provider: ${provider}`);

  if (provider === "ollama") {
    return callOllama(prompt);
  }

  return callGroq(prompt);
}

export function fallbackResponse(): LLMResponse {
  return {
    intent: "unclear",
    symptoms: [],
    specialty: null,
    needs_clarification: false,
    response:
      "I didn't quite understand that. Could you describe your symptoms again?",
  };
}
