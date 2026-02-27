"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface({ userId }: { userId?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your ApnaDoctor assistant. I can help you find the right doctor. What brings you here today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "I'm not feeling well",
    "I need a specialist",
    "Book a checkup",
  ]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [extractedData, setExtractedData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage = { role: "user" as const, content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        setSuggestions(data.suggestions || []);

        if (data.extractedData) {
          setExtractedData((prev: any) => ({
            ...prev,
            ...data.extractedData,
          }));
        }

        // If ready to search, redirect
        if (data.stage === "ready_to_search" && extractedData.specialty) {
          setTimeout(() => {
            const params = new URLSearchParams();
            if (extractedData.specialty)
              params.set("specialization", extractedData.specialty);
            if (extractedData.city) params.set("city", extractedData.city);
            router.push(`/doctors?${params.toString()}`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
        {/* Chat Header */}
        <div className="rounded-t-lg border-b border-gray-200 bg-blue-600 p-4">
          <h2 className="text-lg font-semibold text-white">
            ApnaDoctor AI Assistant
          </h2>
          <p className="text-sm text-blue-100">
            Ask me anything about finding a doctor
          </p>
        </div>

        {/* Messages */}
        <div className="h-96 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <p className="text-sm text-gray-600">Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <p className="mb-2 text-xs text-gray-600">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                  className="rounded-full border border-blue-600 bg-white px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-gray-200 p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
