import { LLMResponse } from "@/types/chat";
import { fallbackResponse } from "../llm";

export async function callGroq(prompt: string): Promise<LLMResponse> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Groq error:", errorText);
    throw new Error(`Groq request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content?.trim()) return fallbackResponse();

  try {
    return JSON.parse(content) as LLMResponse;
  } catch {
    console.error("Groq invalid JSON:", content);
    throw new Error("Groq returned invalid JSON");
  }
}
