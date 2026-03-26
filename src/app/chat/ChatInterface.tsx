"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  Star,
  MapPin,
  ChevronRight,
  Bot,
  User,
  Menu,
  X,
  Clock,
  Stethoscope,
} from "lucide-react";
import { ChatApiResponse, DoctorResult, SlotsByDate } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  options?: string[]; // MCQ pill options
  doctors?: DoctorResult[]; // inline doctor cards
  slots?: SlotsByDate; // inline slot picker
  isError?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  time: string;
}

// Static chat history — replace with dynamic fetch later
const STATIC_CHAT_HISTORY: ChatSession[] = [
  {
    id: "1",
    title: "Skin rash consultation",
    preview: "I have a rash on my arms…",
    time: "Today",
  },
  {
    id: "2",
    title: "Heart checkup",
    preview: "Need a cardiologist near…",
    time: "Yesterday",
  },
  {
    id: "3",
    title: "Child fever - pediatric",
    preview: "My child has had fever for…",
    time: "Mon",
  },
  {
    id: "4",
    title: "Back pain specialist",
    preview: "Lower back pain for 2 weeks",
    time: "Sun",
  },
  {
    id: "5",
    title: "Dental appointment",
    preview: "Tooth pain on the right side",
    time: "Sat",
  },
];

const QUICK_PROMPTS = [
  "I have a skin rash",
  "Need a heart checkup",
  "My child has fever",
  "Back pain for 2 weeks",
  "Dental pain",
  "Eye problem",
];

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your ApnaDoctor AI assistant. Describe your health concern in English or Urdu and I'll match you with the right verified doctor near you.",
      options: [
        "I have a symptom",
        "Need a specialist",
        "Regular checkup",
        "For my child",
      ],
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => uuidv4());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send if navigated from hero with ?q=
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSend(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (
    message: string,
    action?: string,
    payload?: Record<string, string>
  ) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
          action,
          payload,
        }),
      });

      const data: ChatApiResponse = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          doctors: data.doctors,
          slots: data.slots,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleOption = (option: string) => handleSend(option);

  const handleSelectDoctor = (doctorId: string, doctorName: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `I'd like to book Dr. ${doctorName}` },
    ]);
    handleSend(`Selected Dr. ${doctorName}`, "select_doctor", {
      doctor_id: doctorId,
    });
  };

  const handleSelectSlot = (date: string, time: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `I want ${date} at ${time}` },
    ]);
    handleSend(`Selected slot ${date} at ${time}`, "select_slot", {
      date,
      time,
    });
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your ApnaDoctor AI assistant. Describe your health concern in English or Urdu and I'll match you with the right verified doctor near you.",
        options: [
          "I have a symptom",
          "Need a specialist",
          "Regular checkup",
          "For my child",
        ],
      },
    ]);
    setInput("");
    setActiveChat(null);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={{ height: "calc(100vh - 89px)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col transition-transform duration-300 md:relative md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--hero-bg)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          top: "89px",
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Bot size={16} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-semibold text-white">AI Chat</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white md:hidden"
          >
            <X size={14} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-3">
          <button
            onClick={startNewChat}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <Plus size={15} />
            New Conversation
          </button>
        </div>

        {/* Chat history */}
        <div className="dark-scroll flex-1 overflow-y-auto px-3 pb-4">
          <p
            className="mb-2 px-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Recent Chats
          </p>
          <div className="space-y-1">
            {STATIC_CHAT_HISTORY.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id);
                  setSidebarOpen(false);
                }}
                className="group w-full rounded-xl px-3 py-3 text-left transition-all"
                style={
                  activeChat === chat.id
                    ? {
                        background: "rgba(14,165,233,0.15)",
                        border: "1px solid rgba(14,165,233,0.2)",
                      }
                    : {
                        background: "transparent",
                        border: "1px solid transparent",
                      }
                }
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    size={13}
                    className="mt-0.5 shrink-0"
                    style={{
                      color:
                        activeChat === chat.id
                          ? "var(--accent)"
                          : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="truncate text-xs font-semibold"
                        style={{
                          color:
                            activeChat === chat.id
                              ? "var(--accent)"
                              : "rgba(255,255,255,0.75)",
                        }}
                      >
                        {chat.title}
                      </p>
                      <span
                        className="shrink-0 text-[10px]"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        {chat.time}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 truncate text-[11px]"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {chat.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar footer */}
        <div
          className="border-t px-4 py-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Link
            href="/doctors"
            className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <Stethoscope size={12} />
            Browse doctors directly
            <ChevronRight size={11} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Chat topbar */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 md:hidden"
          >
            <Menu size={16} />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--primary-light)" }}
          >
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-dark)" }}
            >
              ApnaDoctor Assistant
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              AI-powered · PMDC-verified doctors
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="mt-1 mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Bot size={13} style={{ color: "var(--primary)" }} />
                </div>
              )}

              <div className="max-w-[80%] space-y-3">
                {/* Bubble */}
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, var(--primary), var(--accent))",
                          color: "white",
                          borderBottomRightRadius: "4px",
                        }
                      : msg.isError
                        ? {
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            borderBottomLeftRadius: "4px",
                          }
                        : {
                            background: "var(--bg-soft)",
                            color: "var(--text-dark)",
                            border: "1px solid var(--primary-light)",
                            borderBottomLeftRadius: "4px",
                          }
                  }
                >
                  {msg.content}
                </div>

                {/* MCQ option pills */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOption(opt)}
                        disabled={loading}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                        style={{
                          borderColor: "var(--primary-light)",
                          color: "var(--primary)",
                          background: "white",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Doctor cards */}
                {msg.doctors && msg.doctors.length > 0 && (
                  <div className="space-y-2">
                    {msg.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md"
                        style={{ borderColor: "var(--primary-light)" }}
                      >
                        <div className="flex items-center gap-3 p-3">
                          {/* Avatar */}
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: "var(--primary-light)" }}
                          >
                            <Stethoscope
                              size={16}
                              style={{ color: "var(--primary)" }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-sm font-bold"
                              style={{ color: "var(--text-dark)" }}
                            >
                              {doc.full_name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--accent)" }}
                            >
                              {doc.specialization}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <MapPin size={10} /> {doc.city}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Star
                                  size={10}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                                {doc.average_rating}
                              </span>
                              <span
                                className="text-[11px] font-semibold"
                                style={{ color: "#059669" }}
                              >
                                PKR {doc.consultation_fee.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleSelectDoctor(doc.id, doc.full_name)
                            }
                            disabled={loading}
                            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--primary), var(--accent))",
                            }}
                          >
                            Select
                          </button>
                        </div>
                        <div
                          className="border-t px-3 py-2"
                          style={{
                            borderColor: "var(--primary-light)",
                            background: "var(--bg-soft)",
                          }}
                        >
                          <Link
                            href={`/doctors/${doc.id}`}
                            className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                            style={{ color: "var(--primary)" }}
                          >
                            View full profile <ChevronRight size={10} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Slot picker */}
                {msg.slots && Object.keys(msg.slots).length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(msg.slots).map(([date, times]) => (
                      <div key={date}>
                        <p
                          className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          <Clock
                            size={11}
                            style={{ color: "var(--primary)" }}
                          />
                          {new Date(date + "T00:00:00").toLocaleDateString(
                            "en-PK",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(times as string[]).map((time) => (
                            <button
                              key={time}
                              onClick={() => handleSelectSlot(date, time)}
                              disabled={loading}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                              style={{
                                borderColor: "var(--primary-light)",
                                color: "var(--primary)",
                                background: "white",
                              }}
                            >
                              {(() => {
                                const [h, m] = time.split(":").map(Number);
                                return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                              })()}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div
                  className="mt-1 ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-light)" }}
                >
                  <User size={13} style={{ color: "var(--primary)" }} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="mt-1 mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--primary-light)" }}
              >
                <Bot size={13} style={{ color: "var(--primary)" }} />
              </div>
              <div
                className="flex items-center gap-1 rounded-2xl px-4 py-3"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--primary-light)",
                  borderBottomLeftRadius: "4px",
                }}
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 animate-bounce rounded-full"
                    style={{
                      background: "var(--primary)",
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts — shown only at start */}
        {messages.length <= 1 && (
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <p className="mb-2 text-xs text-gray-400">Try asking about:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  disabled={loading}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  style={{
                    borderColor: "var(--primary-light)",
                    color: "var(--text-dark)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div
          className="border-t p-4"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div
              className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <Sparkles size={15} style={{ color: "var(--accent)" }} />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your health concern…"
                disabled={loading}
                className="flex-1 bg-transparent py-1 text-sm focus:outline-none disabled:opacity-50"
                style={{ color: "var(--text-dark)" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Send size={15} />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            AI responses are for guidance only — always consult a verified
            doctor.
          </p>
        </div>
      </div>
    </div>
  );
}
