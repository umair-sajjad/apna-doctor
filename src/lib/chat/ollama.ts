const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

export interface OllamaResponse {
  intent: string;
  symptoms?: string[];
  specialty?: string | null;
  needs_clarification?: boolean;
  collected?: { name?: string | null; phone?: string | null };
  all_collected?: boolean;
  response: string;
}

export async function callOllama(prompt: string): Promise<OllamaResponse> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 800,
        num_ctx: 2048,
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Ollama error response:", errorText);
    throw new Error(`Ollama request failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("Ollama raw response:", JSON.stringify(data, null, 2));
  const content = data.message?.content;

  if (!content || content.trim() === "") {
    return {
      intent: "unclear",
      symptoms: [],
      specialty: null,
      needs_clarification: false,
      response:
        "I didn't quite understand that. Could you describe your symptoms again?",
    };
  }

  try {
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return JSON.parse(cleaned) as OllamaResponse;
  } catch {
    console.error("Failed to parse Ollama response:", content);
    throw new Error("Ollama returned invalid JSON");
  }
}
