import { LLMResponse } from "@/types/chat";
import { fallbackResponse } from "../llm";

export async function callOllama(prompt: string): Promise<LLMResponse> {
  const res = await fetch(
    `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "qwen3:1.7b",
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 800,
          num_ctx: 2048,
        },
        messages: [
          {
            role: "system",
            content:
              "Respond immediately in JSON without thinking. No reasoning steps.",
          },
          { role: "user", content: prompt },
        ],
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Ollama error:", errorText);
    throw new Error(`Ollama request failed: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.message?.content;

  if (!raw?.trim()) return fallbackResponse();

  try {
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return JSON.parse(cleaned) as LLMResponse;
  } catch {
    console.error("Ollama invalid JSON:", raw);
    throw new Error("Ollama returned invalid JSON");
  }
}
